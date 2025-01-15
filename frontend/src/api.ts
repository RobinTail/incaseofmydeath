import { Client, Input } from "./generated/api-client.ts";
const host = "https://api.incaseofmy.de:443";

const client = new Client(async (method, path, params) => {
  const hasBody = !["get", "delete"].includes(method);
  const searchParams = hasBody ? "" : `?${new URLSearchParams(params)}`;
  const response = await fetch(`${host}${path}${searchParams}`, {
    method: method.toUpperCase(),
    body: hasBody ? JSON.stringify(params) : undefined,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
  });
  return response.json();
});

export const beginAuth = async () => {
  const response = await client.provide("get /v1/auth/begin", {});
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data.url;
};

export const finishAuth = async (code: string, state: string) => {
  const response = await client.provide("get /v1/auth/finish", {
    code,
    state,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const findInstallation = async (uToken: string) => {
  const response = await client.provide("post /v1/installation/find", {
    uToken,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const listRepos = async (iToken: string, page: number) => {
  const response = await client.provide("get /v1/repos/list", {
    iToken,
    page: `${page}`,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const listWorkflows = async (
  iToken: string,
  owner: string,
  repo: string,
  page: number,
) => {
  const response = await client.provide("get /v1/workflows/list", {
    iToken,
    owner,
    repo,
    page: `${page}`,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const registerWorkflow = async (
  request: Input["post /v1/workflows/register"],
) => {
  const response = await client.provide("post /v1/workflows/register", request);
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const checkRegistration = async ({
  userId,
  iToken,
}: Input["get /v1/registration/check"]) => {
  const response = await client.provide("get /v1/registration/check", {
    userId,
    iToken,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const connectTelegram = async (
  request: Input["post /v1/channels/telegram/connect"],
) => {
  const response = await client.provide(
    "post /v1/channels/telegram/connect",
    request,
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const updateTimeSettings = async (
  request: Input["patch /v1/time/update"],
) => {
  const response = await client.provide("patch /v1/time/update", request);
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const disconnectTelegram = async ({
  userId,
  uToken,
}: Input["delete /v1/channels/telegram/disconnect"]) => {
  const response = await client.provide(
    "delete /v1/channels/telegram/disconnect",
    { userId, uToken },
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const removeRegistration = async ({
  userId,
  uToken,
}: Input["delete /v1/registration/remove"]) => {
  const response = await client.provide("delete /v1/registration/remove", {
    userId,
    uToken,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const getPublicStatus = async (login: string) => {
  const response = await client.provide("get /v2/status/:login", {
    login,
  });
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const setPublicStatus = async (
  request: Input["patch /v1/registration/public"],
) => {
  const response = await client.provide(
    "patch /v1/registration/public",
    request,
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};
