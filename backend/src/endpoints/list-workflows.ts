import { z } from "express-zod-api";
import { installationProviderFactory } from "../factories";

const perPage = 5;

export const listWorkflowsEndpoint = installationProviderFactory.build({
  method: "get",
  input: z.object({
    owner: z.string().min(1),
    repo: z.string().min(1),
    page: z
      .string()
      .regex(/\d+/)
      .transform((v) => parseInt(v, 10) || 1),
  }),
  output: z.object({
    hasMore: z.boolean(),
    workflows: z.array(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1),
      })
    ),
  }),
  handler: async ({
    input: { owner, repo, page },
    options: { installation },
    logger,
  }) => {
    const {
      data: { workflows, total_count: totalCount },
    } = await installation.request(
      "GET /repos/{owner}/{repo}/actions/workflows",
      {
        owner,
        repo,
        per_page: perPage,
        page,
      }
    );
    logger.debug(`Total workflows: ${totalCount}`);
    return {
      hasMore: page * perPage < totalCount,
      workflows: workflows.map(({ id, name }) => ({ id, name })),
    };
  },
});
