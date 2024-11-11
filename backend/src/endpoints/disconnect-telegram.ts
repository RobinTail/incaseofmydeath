import { z } from "zod";
import { authorizedUserFactory } from "../factories.js";

export const disconnectTelegramEndpoint = authorizedUserFactory.build({
  method: "delete",
  output: z.object({}),
  handler: async ({ options: { user } }) => {
    user.telegramChatId = undefined;
    await user.save();
    return {};
  },
});
