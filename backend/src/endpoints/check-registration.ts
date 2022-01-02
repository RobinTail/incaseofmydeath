import { createHttpError, z } from "express-zod-api";
import { checkFreqCodesArray } from "../const";
import { publicUserWithInstallationFactory } from "../factories";

export const checkRegistrationEndpoint =
  publicUserWithInstallationFactory.build({
    method: "get",
    input: z.object({}),
    output: z.object({
      isAlive: z.boolean(),
      isPublic: z.boolean(),
      checkFreq: z.enum(checkFreqCodesArray),
      deadlineDays: z.number().int().positive(),
      attemptsCount: z.number().int().positive(),
      nextCheck: z.date(),
      repo: z.object({
        owner: z.string().nonempty(),
        name: z.string().nonempty(),
      }),
      workflow: z.object({
        id: z.number().int().positive(),
        name: z.string().nonempty(),
      }),
      channels: z.object({
        telegram: z.object({
          connected: z.boolean(),
        }),
      }),
    }),
    handler: async ({ options: { user, installation } }) => {
      if (!user) {
        throw createHttpError(403, "Not registered");
      }
      const {
        data: { name },
      } = await installation.request(
        "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}",
        {
          owner: user.repo.owner,
          repo: user.repo.name,
          workflow_id: user.workflowId,
        }
      );
      return {
        isAlive: user.isAlive,
        isPublic: user.isPublic,
        checkFreq: user.checkFreq,
        deadlineDays: user.deadlineDays,
        attemptsCount: user.attemptsCount,
        nextCheck: user.nextCheck,
        repo: user.repo,
        workflow: { name, id: user.workflowId },
        channels: {
          telegram: {
            connected: !!user.telegramChatId,
          },
        },
      };
    },
  });
