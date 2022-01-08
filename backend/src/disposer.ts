import { Octokit } from "@octokit/core";
import { createLogger } from "express-zod-api";
import { app } from "./app";
import { AliveHook } from "./channel";
import { TelegramChannel } from "./channels/telegram";
import { config } from "./config";
import { msInDay } from "./const";
import { UserDocument, Users } from "./db";
import { debounce } from "./debounce";
import { isProcessMessage } from "./pm";
import { checkFreqToDays } from "./utils";

const runFreq = 10 * 60 * 1000; // interval between runs
const aliveHookThrottle = 60; // seconds

const logger = createLogger(config.logger);

const aliveHook = debounce({
  fn: (async (user) => {
    logger.info(`${user.id} is alive`);
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

const telegramChannel = new TelegramChannel(aliveHook, logger);

const runWorkflow = async (user: UserDocument) => {
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
    logger.error("Failed to run workflow!", e);
    return 500;
  }
};

const check = async () => {
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
      logger.debug("Asked user to confirm the status", user);
    }
  }
  if (shouldMarkAsDead && hasChannel) {
    user.isAlive = false;
    user.lastConfirmation = new Date();
    logger.info("User is dead", user);
    const status = await runWorkflow(user);
    logger.debug("Workflow execution request status", status);
  }
  await user.save();
};

(async () => {
  const botInfo = await telegramChannel.ready;
  logger.info("Telegram bot", botInfo);

  let queue = Promise.resolve();
  const cycleFn = () => {
    queue = queue.then(check).then(() => {
      setTimeout(cycleFn, runFreq);
    });
  };
  setTimeout(cycleFn, runFreq);
})();

process.on("message", async (message: unknown) => {
  logger.debug("Incoming message", message);
  if (!isProcessMessage(message)) {
    logger.warn("Invalid process message", message);
    return;
  }
  if (message.code === "onConnected") {
    if (message.channel === "telegram" && message.payload) {
      const user = await Users.findOne({
        telegramChatId: message.payload,
      }).exec();
      if (user) {
        await telegramChannel.onConnected(user);
      }
    }
  }
});
