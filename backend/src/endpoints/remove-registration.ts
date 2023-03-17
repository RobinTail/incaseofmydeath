import { z } from "zod";
import { Users } from "../db";
import { authorizedUserFactory } from "../factories";

export const removeRegistrationEndpoint = authorizedUserFactory.build({
  method: "delete",
  input: z.object({}),
  output: z.object({}),
  handler: async ({
    options: {
      user: { _id },
    },
  }) => {
    await Users.deleteOne({ _id }).exec();
    return {};
  },
});
