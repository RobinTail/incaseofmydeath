import { z } from "express-zod-api";
import { authorizedUserFactory } from "../factories";

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
