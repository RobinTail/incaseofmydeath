import { z } from "zod";
import { Users } from "../db";
import { authorizedUserFactory } from "../factories";

export const removeRegistrationEndpoint = authorizedUserFactory.build({
  method: "delete",
  input: z.object({}),
  output: z.object({}),
  handler: async ({ options: { user } }) => {
    await Users.deleteOne({ _id: user._id }).exec();
    return {};
  },
});
