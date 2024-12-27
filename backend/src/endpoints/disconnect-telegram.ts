import { authorizedUserFactory } from "../factories.js";

export const disconnectTelegramEndpoint = authorizedUserFactory.buildVoid({
  method: "delete",
  handler: async ({ options: { user } }) => {
    user.telegramChatId = undefined;
    await user.save();
  },
});
