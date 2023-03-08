import { z } from "zod";
import { installationProviderFactory } from "../factories";

export const registerWorkflowEndpoint = installationProviderFactory.build({
  method: "post",
  input: z.object({
    installationId: z.number().int().positive(),
    owner: z.string().min(1),
    repo: z.string().min(1),
    workflowId: z.number().int().positive(),
  }),
  output: z.object({
    userId: z.number().int().positive(),
  }),
  handler: async ({
    input: { owner, repo, workflowId, installationId },
    options: { installation, Users },
  }) => {
    // check the repo and owner
    const {
      data: {
        owner: { id: userId },
        default_branch: branch,
      },
    } = await installation.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });
    // check the workflow availability
    await installation.request(
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}",
      {
        owner,
        repo,
        workflow_id: workflowId,
      }
    );
    const user = new Users({
      id: userId,
      installationId,
      workflowId,
      repo: { owner, name: repo, branch },
    });
    await user.save();
    return { userId: user.id };
  },
});
