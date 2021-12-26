import { z } from "express-zod-api";
import { checkFreqCodesArray } from "../const";
import { publicUserWithInstallationFactory } from "../factories";

// @todo perhaps it can just throw error instead of boolean response
export const checkRegistrationEndpoint =
  publicUserWithInstallationFactory.build({
    method: "get",
    input: z.object({}),
    output: z
      .object({
        isRegistered: z.literal(false),
      })
      .or(
        z.object({
          isRegistered: z.literal(true),
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
        })
      ),
    handler: async ({ options: { user, installation } }) => {
      if (!user) {
        return { isRegistered: false as const };
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
        isRegistered: true as const,
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
