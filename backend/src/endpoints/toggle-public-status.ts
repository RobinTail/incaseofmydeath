import { z } from "zod";
import { authorizedUserFactory } from "../factories.js";

export const togglePublicStatusEndpoint = authorizedUserFactory.buildVoid({
  method: "patch",
  input: z.object({
    isPublic: z.boolean(),
  }),
  handler: async ({ input: { isPublic }, options: { user } }) => {
    user.isPublic = isPublic;
    await user.save();
  },
});
