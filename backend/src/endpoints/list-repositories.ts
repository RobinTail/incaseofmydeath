import { z } from "zod";
import { installationProviderFactory } from "../factories";

const perPage = 5;

export const listRepositoriesEndpoint = installationProviderFactory.build({
  method: "get",
  input: z.object({
    page: z
      .string()
      .regex(/\d+/)
      .transform((v) => parseInt(v, 10) || 1),
  }),
  output: z.object({
    repositories: z.array(
      z.object({
        login: z.string().min(1),
        name: z.string().min(1),
        isPrivate: z.boolean(),
      })
    ),
    hasMore: z.boolean(),
  }),
  handler: async ({ input: { page }, options: { installation }, logger }) => {
    const {
      data: { repositories, total_count: totalCount },
    } = await installation.request("GET /installation/repositories", {
      per_page: perPage,
      page,
    });
    logger.debug(`Total repos ${totalCount}`);
    return {
      hasMore: page * perPage < totalCount,
      repositories: repositories.map((entry) => ({
        login: entry.owner.login,
        name: entry.name,
        isPrivate: entry.private,
      })),
    };
  },
});
