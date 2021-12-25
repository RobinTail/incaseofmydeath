import { z } from "express-zod-api";
import { authorizedUserFactory } from "../factories";

export const disconnectTelegramEndpoint = authorizedUserFactory.build({
  method: "delete",
  input: z.object({}),
  output: z.object({}),
  handler: async ({ options: { user } }) => {
    user.telegramChatId = undefined;
    await user.save();
    return {};
  },
});
