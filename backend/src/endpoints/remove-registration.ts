import { z } from "express-zod-api";
import { authorizedUserFactory } from "../factories";

export const removeRegistrationEndpoint = authorizedUserFactory.build({
  method: "delete",
  input: z.object({}),
  output: z.object({}),
  handler: async ({ options: { user } }) => {
    await user.delete();
    return {};
  },
});
