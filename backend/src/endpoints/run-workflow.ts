import { z } from "express-zod-api";
import { installationProviderFactory } from "../factories";

export const runWorkflowEndpoint = installationProviderFactory.build({
  method: "post",
  input: z.object({
    owner: z.string().nonempty(),
    repo: z.string().nonempty(),
    workflowId: z.number().int().positive(),
    branch: z.string().nonempty(),
  }),
  output: z.object({}),
  handler: async ({
    input: { owner, repo, workflowId, branch },
    options: { installation },
  }) => {
    await installation.request(
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
      {
        owner,
        repo,
        workflow_id: workflowId,
        ref: branch,
        // inputs: {}
      }
    );
    return {}; // GET /repos/{owner}/{repo}/actions/runs
  },
});
