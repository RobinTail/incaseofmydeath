import { defaultEndpointsFactory } from "express-zod-api";
import crypto from "node:crypto";
import { z } from "zod";
import { github } from "../config.js";

export const beginAuthenticationEndpoint = defaultEndpointsFactory.build({
  method: "get",
  input: z.object({}),
  output: z.object({
    url: z.string(),
  }),
  handler: async () => {
    const hash = crypto
      .createHash("sha1")
      .update(`${Date.now()}`)
      .digest("hex");
    return {
      url: `https://github.com/login/oauth/authorize?client_id=${github.clientId}&state=${hash}`,
    };
  },
});
