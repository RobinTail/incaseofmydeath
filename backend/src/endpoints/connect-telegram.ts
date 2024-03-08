import { z } from "zod";
import { tgBot } from "../config.js";
import { authorizedUserFactory } from "../factories.js";
import crypto from "node:crypto";

export const connectTelegramEndpoint = authorizedUserFactory.build({
  method: "post",
  input: z.object({
    chatId: z.string().min(1),
    hash: z.string().min(1),
    dataCheckString: z.string().min(1), // @see https://core.telegram.org/widgets/login#checking-authorization
  }),
  output: z.object({
    userId: z.number().int().positive(),
    chatId: z.string().min(1),
  }),
  handler: async ({
    input: { dataCheckString, hash, chatId },
    options: { user, processManager },
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
    await processManager.send(processManager.disposerProcess, {
      code: "onConnected",
      channel: "telegram",
      payload: chatId,
    });
    return { userId: user.id, chatId: user.telegramChatId };
  },
});
