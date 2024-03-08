import { z } from "zod";
import { authorizedUserFactory } from "../factories.js";

export const togglePublicStatusEndpoint = authorizedUserFactory.build({
  method: "patch",
  input: z.object({
    isPublic: z.boolean(),
  }),
  output: z.object({}),
  handler: async ({ input: { isPublic }, options: { user } }) => {
    user.isPublic = isPublic;
    await user.save();
    return {};
  },
});
