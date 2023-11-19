import { Octokit } from "@octokit/core";
import { app } from "./app";
import { AliveHook } from "./channel";
import { TelegramChannel } from "./channels/telegram";
import { logger } from "./config";
import { msInDay } from "./const";
import { UserDocument, Users } from "./db";
import { debounce } from "./debounce";
import { isPacket, isProcessMessage } from "./pm";
import { checkFreqToDays } from "./utils";

const runFreq = 10 * 60 * 1000; // interval between runs
const aliveHookThrottle = 60; // seconds

const aliveHook = debounce({
  fn: (async (user) => {
    logger.info(`${user.id} is alive`);
    user.isAlive = true;
    user.isCountdown = false; // regular schedule
    user.lastConfirmation = new Date();
    user.nextCheck = new Date(
      Date.now() + checkFreqToDays(user.checkFreq) * msInDay,
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
      { installation_id: user.installationId },
    );
    const installation = new Octokit({ auth: iToken });
    const { status } = await installation.request(
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner: user.repo.owner,
        repo: user.repo.name,
        workflow_id: user.workflowId,
        ref: user.repo.branch,
      },
    );
    return status;
  } catch (e) {
    logger.error("Failed to run workflow!", e);
    return 500;
  }
};

const check = async () => {
  logger.debug("Running the check cycle...");
  const user = await Users.findOne({
    isAlive: true,
    nextCheck: { $lte: new Date() },
  }).exec();
  if (!user) {
    logger.debug("All clear");
    return;
  }
  logger.debug(`Checking user: ${user.id}`);
  let shouldMarkAsDead = false;
  const deadline =
    user.lastConfirmation.valueOf() +
    (checkFreqToDays(user.checkFreq) + user.deadlineDays) * msInDay;
  if (user.isCountdown && deadline < Date.now()) {
    shouldMarkAsDead = true;
  }
  const hasChannel = !!user.telegramChatId; // add more here
  if (user.telegramChatId) {
    await telegramChannel.ready;
    if (shouldMarkAsDead) {
      await telegramChannel.rip(user);
    } else {
      await telegramChannel.ask(user);
      // countdown schedule
      user.isCountdown = true;
      user.nextCheck = new Date(
        Date.now() + (user.deadlineDays * msInDay) / (user.attemptsCount + 1),
      );
      logger.debug("Asked user to confirm the status", user);
    }
  }
  if (shouldMarkAsDead && hasChannel) {
    user.isAlive = false;
    user.isCountdown = false;
    user.lastConfirmation = new Date();
    logger.info("User is dead", user);
    const status = await runWorkflow(user);
    logger.debug("Workflow execution request status", { status });
  }
  await user.save();
};

(async () => {
  logger.info("Disposer");
  try {
    const botInfo = await telegramChannel.ready;
    logger.info("Telegram bot", botInfo);
  } catch (e) {
    logger.error("Failed to start Telegram bot", e);
  }

  let queue = Promise.resolve();
  const cycleFn = () => {
    queue = queue.then(check).then(() => {
      setTimeout(cycleFn, runFreq);
    });
  };
  setTimeout(cycleFn, runFreq);
})();

process.on("message", async (packet: unknown) => {
  logger.debug("Incoming packet", packet);
  if (!isPacket(packet)) {
    logger.warn("Invalid packet received", packet);
    return;
  }
  const message = packet.data;
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
