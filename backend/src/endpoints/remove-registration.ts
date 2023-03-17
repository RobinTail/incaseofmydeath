import { z } from "zod";
import { authorizedUserFactory } from "../factories";

export const removeRegistrationEndpoint = authorizedUserFactory.build({
  method: "delete",
  input: z.object({}),
  output: z.object({}),
  handler: async ({
    options: {
      user: { _id },
      Users,
    },
  }) => {
    await Users.deleteOne({ _id }).exec();
    return {};
  },
});
