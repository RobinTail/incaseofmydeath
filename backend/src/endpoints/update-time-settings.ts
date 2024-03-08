import { ez } from "express-zod-api";
import { z } from "zod";
import { checkFreqCodesArray, msInDay } from "../const.js";
import { authorizedUserFactory } from "../factories.js";
import { checkFreqToDays } from "../utils.js";

export const updateTimeSettingsEndpoint = authorizedUserFactory.build({
  method: "patch",
  input: z.object({
    checkFreq: z.enum(checkFreqCodesArray),
    deadlineDays: z.number().int().positive(),
    attemptsCount: z.number().int().positive(),
  }),
  output: z.object({
    nextCheck: ez.dateOut(),
  }),
  handler: async ({
    input: { checkFreq, deadlineDays, attemptsCount },
    options: { user },
  }) => {
    if (!user) {
      throw new Error("User not found");
    }
    // @todo this might better trigger Disposer alive hook
    user.checkFreq = checkFreq;
    user.deadlineDays = deadlineDays;
    user.attemptsCount = attemptsCount;
    user.isAlive = true;
    user.isCountdown = false;
    user.lastConfirmation = new Date();
    user.nextCheck = new Date(
      Date.now() + checkFreqToDays(checkFreq) * msInDay,
    );
    await user.save();
    return {
      nextCheck: user.nextCheck,
    };
  },
});
