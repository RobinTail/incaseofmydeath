import { Octokit } from "@octokit/core";
import { Middleware } from "express-zod-api";
import { z } from "zod";
import { app } from "./app.js";
import { UserDocument, Users } from "./db.js";
import { createProcessManager } from "./pm.js";

export const installationProviderMiddleware = new Middleware({
  security: { type: "input", name: "iToken" },
  input: z.object({
    iToken: z.string().min(1),
  }),
  handler: async ({ input: { iToken } }) => ({
    installation: new Octokit({ auth: iToken }),
  }),
});

const userIdSchema = z
  .number()
  .int()
  .positive()
  .or(
    z
      .string()
      .regex(/\d+/)
      .transform((v) => parseInt(v, 10)),
  );

const loginSchema = z
  .string()
  .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);

const getUserAccount = async (user: UserDocument) => {
  const {
    data: { account },
  } = await app.request("GET /app/installations/{installation_id}", {
    installation_id: user.installationId,
  });
  if (!account) {
    throw new Error("No account in response");
  }
  if (!("login" in account)) {
    throw new Error("Enterprise accounts are not supported");
  }
  if (user.id !== account.id) {
    throw new Error("Invalid userId");
  }
  return account;
};

export const publicUserProviderByIdMiddleware = new Middleware({
  input: z.object({
    userId: userIdSchema,
  }),
  handler: async ({ input: { userId } }) => {
    const user = await Users.findOne({ id: userId }).exec();
    if (!user) {
      return { user: null, account: null };
    }
    return { user, account: await getUserAccount(user) };
  },
});

export const publicUserProviderByLoginMiddleware = new Middleware({
  input: z.object({
    login: loginSchema,
  }),
  handler: async ({ input: { login } }) => {
    const user = await Users.findOne({ "repo.owner": login }, undefined, {
      collation: { locale: "en_US", strength: 1, caseLevel: false },
    });
    if (!user) {
      return { user: null, account: null };
    }
    return { user, account: await getUserAccount(user) };
  },
});

export const authorizedUserProviderMiddleware = new Middleware({
  security: { type: "input", name: "uToken" },
  input: z.object({
    uToken: z.string().min(1),
    userId: userIdSchema,
  }),
  handler: async ({ input: { uToken, userId } }) => {
    const user = await Users.findOne({ id: userId }).exec();
    if (!user) {
      throw new Error("User not found");
    }
    const kit = new Octokit({ auth: uToken });
    const { data: account } = await kit.request("GET /user");
    if (account.id !== userId) {
      throw new Error("Invalid userId");
    }
    if (!("login" in account)) {
      throw new Error("Enterprise accounts are not supported");
    }
    return { user, account };
  },
});

export const processManagerProviderMiddleware = new Middleware({
  handler: async () => ({
    processManager: await createProcessManager(),
  }),
});
