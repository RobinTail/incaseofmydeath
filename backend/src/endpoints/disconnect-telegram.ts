import { z } from "zod";
import { authorizedUserFactory } from "../factories.js";

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
