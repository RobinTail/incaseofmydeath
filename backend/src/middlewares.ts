import { Octokit } from "@octokit/core";
import { createMiddleware } from "express-zod-api";
import { z } from "zod";
import { app } from "./app";
import { UserDocument, Users } from "./db";
import { createProcessManager } from "./pm";

export const installationProviderMiddleware = createMiddleware({
  security: { type: "input", name: "iToken" },
  input: z.object({
    iToken: z.string().min(1),
  }),
  middleware: async ({ input: { iToken } }) => ({
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

export const publicUserProviderByIdMiddleware = createMiddleware({
  input: z.object({
    userId: userIdSchema,
  }),
  middleware: async ({ input: { userId } }) => {
    const user = await Users.findOne({ id: userId }).exec();
    if (!user) {
      return { user: null, account: null };
    }
    return { user, account: await getUserAccount(user) };
  },
});

export const publicUserProviderByLoginMiddleware = createMiddleware({
  input: z.object({
    login: loginSchema,
  }),
  middleware: async ({ input: { login } }) => {
    const user = await Users.findOne({ "repo.owner": login }, undefined, {
      collation: { locale: "en_US", strength: 1, caseLevel: false },
    });
    if (!user) {
      return { user: null, account: null };
    }
    return { user, account: await getUserAccount(user) };
  },
});

export const authorizedUserProviderMiddleware = createMiddleware({
  security: { type: "input", name: "uToken" },
  input: z.object({
    uToken: z.string().min(1),
    userId: userIdSchema,
  }),
  middleware: async ({ input: { uToken, userId } }) => {
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

export const processManagerProviderMiddleware = createMiddleware({
  input: z.object({}),
  middleware: async () => ({
    processManager: await createProcessManager(),
  }),
});
