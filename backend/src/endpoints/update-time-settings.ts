import { z } from "express-zod-api";
import { checkFreqCodesArray, msInDay } from "../const";
import { authorizedUserFactory } from "../factories";
import { checkFreqToDays } from "../utils";

export const updateTimeSettingsEndpoint = authorizedUserFactory.build({
  method: "patch",
  input: z.object({
    checkFreq: z.enum(checkFreqCodesArray),
    deadlineDays: z.number().int().positive(),
    attemptsCount: z.number().int().positive(),
  }),
  output: z.object({
    nextCheck: z.date().transform((date) => date.toISOString()),
  }),
  handler: async ({
    input: { checkFreq, deadlineDays, attemptsCount },
    options: { user },
  }) => {
    if (!user) {
      throw new Error("User not found");
    }
    user.checkFreq = checkFreq;
    user.deadlineDays = deadlineDays;
    user.attemptsCount = attemptsCount;
    user.isAlive = true;
    user.lastConfirmation = new Date();
    user.nextCheck = new Date(
      Date.now() + checkFreqToDays(checkFreq) * msInDay
    );
    await user.save();
    return {
      nextCheck: user.nextCheck,
    };
  },
});
