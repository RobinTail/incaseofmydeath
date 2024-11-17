import { createOAuthUserAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { z } from "zod";
import { github } from "../config.js";
import { endpointsFactory } from "../factories.js";

export const finishAuthenticationEndpoint = endpointsFactory.build({
  input: z.object({
    code: z.string().min(1),
    state: z.string().optional(),
  }),
  output: z.object({
    id: z.number().int().positive(),
    login: z.string().min(1),
    avatarUrl: z.string().optional(),
    name: z.string().nullable(),
    uToken: z.string().min(1),
  }),
  handler: async ({ input, logger }) => {
    const auth = createOAuthUserAuth({
      clientId: github.clientId,
      clientSecret: github.clientSecret,
      code: input.code,
      state: input.state,
    });
    const { token: uToken } = await auth();
    const kit = new Octokit({ auth: uToken });
    const {
      data: { id, login, avatar_url: avatarUrl, name },
    } = await kit.request("GET /user");
    logger.debug(`Authorized: ${login}`);

    return { id, login, name, avatarUrl, uToken };
  },
});
