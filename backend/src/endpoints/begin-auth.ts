import crypto from "crypto";
import { z } from "zod";
import { appProviderFactory } from "../factories";

export const beginAuthenticationEndpoint = appProviderFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({
    url: z.string(),
  }),
  handler: async ({ options: { github } }) => {
    const hash = crypto
      .createHash("sha1")
      .update(`${Date.now()}`)
      .digest("hex");
    return {
      url: `https://github.com/login/oauth/authorize?client_id=${github.clientId}&state=${hash}`,
    };
  },
});
