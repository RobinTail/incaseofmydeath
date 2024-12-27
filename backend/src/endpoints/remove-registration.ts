import { Users } from "../db.js";
import { authorizedUserFactory } from "../factories.js";

export const removeRegistrationEndpoint = authorizedUserFactory.buildVoid({
  method: "delete",
  handler: async ({
    options: {
      user: { _id },
    },
  }) => {
    await Users.deleteOne({ _id }).exec();
  },
});
