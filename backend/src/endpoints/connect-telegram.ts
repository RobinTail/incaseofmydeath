import { z } from "express-zod-api";
import { telegramChannel } from "../channels/telegram";
import { tgBot } from "../config";
import { authorizedUserFactory } from "../factories";
import crypto from "crypto";

export const connectTelegramEndpoint = authorizedUserFactory.build({
  method: "post",
  input: z.object({
    chatId: z.string().nonempty(),
    hash: z.string().nonempty(),
    dataCheckString: z.string().nonempty(), // @see https://core.telegram.org/widgets/login#checking-authorization
  }),
  output: z.object({
    userId: z.number().int().positive(),
    chatId: z.string().nonempty(),
  }),
  handler: async ({
    input: { dataCheckString, hash, chatId },
    options: { user },
  }) => {
    const secretKey = crypto.createHash("sha256").update(tgBot.token).digest();
    const validation = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");
    if (hash !== validation) {
      throw new Error("Hash validation failed.");
    }
    user.telegramChatId = chatId;
    await user.save();
    await telegramChannel.onConnected(user); // @todo find another approach (extract the bot from api)
    return { userId: user.id, chatId: user.telegramChatId };
  },
});
