import { createOAuthUserAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { createHttpError, z } from "express-zod-api";
import { github } from "../config";
import { endpointsFactory } from "../factories";

const betaTesters: string[] = ["RobinTail"];

export const finishAuthenticationEndpoint = endpointsFactory.build({
  method: "get",
  input: z.object({
    code: z.string().nonempty(),
    state: z.string().optional(),
  }),
  output: z.object({
    id: z.number().int().positive(),
    login: z.string().nonempty(),
    avatarUrl: z.string().optional(),
    name: z.string().nullable(),
    uToken: z.string().nonempty(),
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

    // @todo remove after beta testing
    if (!betaTesters.includes(login)) {
      throw createHttpError(
        403,
        "The App is currently in closed beta testing. " +
          "Join testing here: https://github.com/RobinTail/incaseofmydeath/discussions/2"
      );
    }

    return { id, login, name, avatarUrl, uToken };
  },
});
