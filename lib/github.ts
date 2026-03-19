import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";

function getPrivateKey() {
  const key = process.env.GITHUB_PRIVATE_KEY;
  if (!key) throw new Error("GITHUB_PRIVATE_KEY is not set");
  return key.replace(/\\n/g, "\n");
}

function getAppId() {
  const id = process.env.GITHUB_APP_ID;
  if (!id) throw new Error("GITHUB_APP_ID is not set");
  return id;
}

function getClientId() {
  const id = process.env.GITHUB_CLIENT_ID;
  if (!id) throw new Error("GITHUB_CLIENT_ID is not set");
  return id;
}

function getClientSecret() {
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!secret) throw new Error("GITHUB_CLIENT_SECRET is not set");
  return secret;
}

export function getUserOctokit(token: string) {
  return new Octokit({ auth: token });
}

export function getAppOctokit() {
  const auth = createAppAuth({
    appId: getAppId(),
    privateKey: getPrivateKey(),
  });
  return new Octokit({ auth });
}

export async function getInstallationToken(installationId: number) {
  const octokit = getAppOctokit();
  const { data } = await octokit.request(
    "POST /app/installations/{installation_id}/access_tokens",
    { installation_id: installationId },
  );
  return data.token;
}

export async function getOAuthAccessToken(code: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code,
    }),
  });
  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };
  if (data.error) {
    throw new Error(data.error);
  }
  return data.access_token!;
}

export async function getGitHubUser(token: string) {
  const octokit = getUserOctokit(token);
  const { data } = await octokit.request("GET /user");
  return data;
}

export async function findAppInstallation(token: string) {
  const octokit = getUserOctokit(token);
  const { data } = await octokit.request("GET /user/installations");
  const installation = data.installations?.find(
    (i: { app_id: number }) => i.app_id === parseInt(getAppId()),
  );
  if (!installation) {
    return null;
  }
  return installation;
}

export async function triggerWorkflow(
  installationId: number,
  owner: string,
  repo: string,
  workflowId: number,
  ref: string,
) {
  const token = await getInstallationToken(installationId);
  const octokit = new Octokit({ auth: token });
  await octokit.request(
    "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches",
    {
      owner,
      repo,
      workflow_id: workflowId,
      ref,
    },
  );
}

export function getOAuthUrl(state: string) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const redirectUri = `${frontendUrl}/api/auth/callback`;
  return `https://github.com/login/oauth/authorize?client_id=${getClientId()}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo&state=${state}`;
}
