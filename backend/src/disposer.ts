import { Octokit } from "@octokit/core";
import { app } from "./app";
import { AliveHook } from "./channel";
import { telegramChannel } from "./channels/telegram";
import { msInDay } from "./const";
import { UserDocument, Users } from "./db";
import { debounce } from "./debounce";
import { checkFreqToDays } from "./utils";

const runFreq = 10 * 60 * 1000; // interval between runs
const aliveHookThrottle = 60; // seconds

class Disposer {
  #queue = Promise.resolve();

  constructor() {
    const cycleFn = () => {
      this.#queue = this.#queue.then(Disposer.#check).then(() => {
        setTimeout(cycleFn, runFreq);
      });
    };
    setTimeout(cycleFn, runFreq);
  }

  static async #check() {
    const user = await Users.findOne({
      isAlive: true,
      nextCheck: { $lte: new Date() },
    }).exec();
    if (!user) {
      return;
    }
    let shouldMarkAsDead = false;
    if (
      user.lastConfirmation.valueOf() + user.deadlineDays * msInDay <
      Date.now()
    ) {
      shouldMarkAsDead = true;
    }
    const hasChannel = !!user.telegramChatId; // add more here
    if (user.telegramChatId) {
      await telegramChannel.ready;
      if (shouldMarkAsDead) {
        await telegramChannel.rip(user);
      } else {
        await telegramChannel.ask(user);
        user.nextCheck = new Date(
          Date.now() + (user.deadlineDays * msInDay) / (user.attemptsCount + 1) // countdown schedule
        );
        console.log("Asked user to confirm the status", user);
      }
    }
    if (shouldMarkAsDead && hasChannel) {
      user.isAlive = false;
      user.lastConfirmation = new Date();
      console.log("User is dead", user);
      const status = await Disposer.#runWorkflow(user);
      console.log("Workflow execution request status", status);
    }
    await user.save();
  }

  static async #runWorkflow(user: UserDocument) {
    try {
      const {
        data: { token: iToken },
      } = await app.request(
        "POST /app/installations/{installation_id}/access_tokens",
        { installation_id: user.installationId }
      );
      const installation = new Octokit({ auth: iToken });
      const { status } = await installation.request(
        "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
        {
          owner: user.repo.owner,
          repo: user.repo.name,
          workflow_id: user.workflowId,
          ref: user.repo.branch,
        }
      );
      return status;
    } catch (e) {
      console.error(e);
      return 500;
    }
  }

  public aliveHook = debounce({
    fn: (async (user) => {
      console.log(`${user.id} is alive`);
      user.isAlive = true;
      user.lastConfirmation = new Date();
      user.nextCheck = new Date(
        Date.now() + checkFreqToDays(user.checkFreq) * msInDay // regular schedule
      );
      await user.save();
    }) as AliveHook,
    name: "alive-hook",
    seconds: aliveHookThrottle,
    mapper: (user: UserDocument) => `${user.id}`,
  });
}

export const disposer = new Disposer();
