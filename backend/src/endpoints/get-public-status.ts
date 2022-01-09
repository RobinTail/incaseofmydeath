import { createHttpError, z } from "express-zod-api";
import { publicUserFactory } from "../factories";

export const getPublicStatusEndpoint = publicUserFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({
    login: z.string().nonempty(),
    avatarUrl: z.string().optional(),
    name: z.string().nullable(),
    isAlive: z.boolean(),
    lastConfirmation: z.date().transform((date) => date.toISOString()),
  }),
  handler: async ({ options: { user, account }, logger }) => {
    logger.debug("Account information", account);
    if (!user || !user.isPublic || !account || !account.login) {
      throw createHttpError(404, "Not found");
    }
    return {
      avatarUrl: account.avatar_url,
      login: account.login,
      name: account.name || null,
      isAlive: user.isAlive,
      lastConfirmation: user.lastConfirmation,
    };
  },
});
