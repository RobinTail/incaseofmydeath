import { z } from "zod";
import { Users } from "../db.js";
import { authorizedUserFactory } from "../factories.js";

export const removeRegistrationEndpoint = authorizedUserFactory.build({
  method: "delete",
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
