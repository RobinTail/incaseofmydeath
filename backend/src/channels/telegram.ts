import { Telegraf } from "telegraf";
import type { UserFromGetMe } from "typegram/manage";
import { Channel, AliveHook } from "../channel";
import { frontendUrl, tgBot } from "../config";
import { UserDocument, Users } from "../db";
import { debounce } from "../debounce";
import { disposer } from "../disposer";

type AliveConsideringPayload = { chatId: string } | { user: UserDocument };
const aliveConsideringThrottle = 60; // seconds

class TelegramChannel implements Channel {
  readonly #hook: AliveHook;
  readonly #bot: Telegraf;
  public ready: Promise<UserFromGetMe>;

  constructor(hook: AliveHook) {
    this.#hook = hook;
    const bot = new Telegraf(tgBot.token);
    this.ready = new Promise<UserFromGetMe>(async (resolve, reject) => {
      try {
        await bot.launch();
        bot.botInfo = await bot.telegram.getMe();
        resolve(bot.botInfo);
      } catch (e) {
        reject(e);
      }
    });
    bot.start((ctx) => {
      ctx.reply(
        `Please go to the [application website](${frontendUrl}) for registration and setup`,
        { parse_mode: "MarkdownV2" }
      );
      return this.#considerAlive({ chatId: String(ctx.from.id) });
    });
    bot.help((ctx) => {
      ctx.reply(
        `You may find all information on the [application website](${frontendUrl})`,
        { parse_mode: "MarkdownV2" }
      );
      return this.#considerAlive({ chatId: String(ctx.from.id) });
    });
    bot.on("message", (ctx) =>
      this.#considerAlive({ chatId: String(ctx.from.id) })
    );
    this.#bot = bot;
  }

  #considerAlive = debounce({
    fn: async (payload: AliveConsideringPayload) => {
      console.log("Telegram: considering alive", payload);
      let user: UserDocument | null;
      if ("user" in payload) {
        user = payload.user;
      } else {
        user = await Users.findOne({ telegramChatId: payload.chatId }).exec();
      }
      if (user) {
        await this.#hook(user);
      }
    },
    name: "telegram-consider-alive",
    seconds: aliveConsideringThrottle,
    mapper: (payload) =>
      "user" in payload ? `${payload.user.id}` : `${payload.chatId}`,
  });

  public async onConnected(user: UserDocument) {
    await this.#considerAlive({ user });
    if (user.telegramChatId) {
      await this.#bot.telegram.sendMessage(
        user.telegramChatId,
        "Done! The communication channel is established."
      );
    }
  }

  public async ask(user: UserDocument) {
    if (user.telegramChatId) {
      await this.#bot.telegram.sendMessage(
        user.telegramChatId,
        "Are you alive? Please send me any message to confirm."
      );
    }
  }

  public async rip(user: UserDocument) {
    if (user.telegramChatId) {
      await this.#bot.telegram.sendMessage(
        user.telegramChatId,
        "According to our agreement I consider you dead."
      );
    }
  }
}

export const telegramChannel = new TelegramChannel(disposer.aliveHook);
