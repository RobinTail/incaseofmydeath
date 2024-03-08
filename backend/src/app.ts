import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { github } from "./config.js";

export const app = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: github.appId,
    privateKey: github.privateKey,
  },
});
