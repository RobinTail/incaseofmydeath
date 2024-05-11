import { Octokit } from "@octokit/core";
import { components } from "@octokit/openapi-types";
import { defaultEndpointsFactory } from "express-zod-api";
import { z } from "zod";
import { app } from "../app.js";
import { github } from "../config.js";

const perPage = 50;

export const findInstallationEndpoint = defaultEndpointsFactory.build({
  method: "post",
  input: z.object({
    uToken: z.string().min(1),
  }),
  output: z.object({
    id: z.number().int().positive(),
    iToken: z.string().min(1),
    expiresAt: z.string().min(1), // timestamp
  }),
  handler: async ({ input: { uToken }, logger }) => {
    const kit = new Octokit({ auth: uToken });
    let page = 1;
    let hasMore = false;
    let installation: components["schemas"]["installation"] | undefined;
    do {
      const {
        data: { total_count: totalCount, installations },
      } = await kit.request("GET /user/installations", {
        per_page: perPage,
        page,
      });
      hasMore = page * perPage < totalCount;
      logger.debug(`Total installations: ${totalCount}`);
      installation = installations.find(
        (entry) => entry.app_id === github.appId,
      );
    } while (!installation && hasMore);
    if (!installation) {
      throw new Error("Can not find the App installation");
    }
    const {
      data: { token: iToken, expires_at: expiresAt },
    } = await app.request(
      "POST /app/installations/{installation_id}/access_tokens",
      { installation_id: installation.id },
    );
    return { id: installation.id, iToken, expiresAt };
  },
});
