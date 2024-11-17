import createHttpError from "http-errors";
import { ez } from "express-zod-api";
import { z } from "zod";
import { checkFreqCodesArray } from "../const.js";
import { publicUserWithInstallationFactory } from "../factories.js";

export const checkRegistrationEndpoint =
  publicUserWithInstallationFactory.build({
    output: z.object({
      isAlive: z.boolean(),
      isPublic: z.boolean(),
      checkFreq: z.enum(checkFreqCodesArray),
      deadlineDays: z.number().int().positive(),
      attemptsCount: z.number().int().positive(),
      nextCheck: ez.dateOut(),
      repo: z.object({
        owner: z.string().min(1),
        name: z.string().min(1),
      }),
      workflow: z.object({
        id: z.number().int().positive(),
        name: z.string().min(1),
      }),
      channels: z.object({
        telegram: z.object({ connected: z.boolean() }),
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
        },
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
