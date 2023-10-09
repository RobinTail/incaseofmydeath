import { ez } from "express-zod-api";
import createHttpError from "http-errors";
import { z } from "zod";
import { publicUserByLoginFactory } from "../factories";

export const getPublicStatusByLoginEndpoint = publicUserByLoginFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({
    login: z.string().min(1),
    avatarUrl: z.string().optional(),
    name: z.string().nullable(),
    isAlive: z.boolean(),
    lastConfirmation: ez.dateOut(),
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
