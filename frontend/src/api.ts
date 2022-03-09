import type {
  BeginAuthEndpointResponse,
  FinishAuthEndpointResponse,
  FindInstallationEndpointResponse,
  ListReposEndpointResponse,
  ListWorkflowsEndpointResponse,
  RegisterWorkflowEndpointResponse,
  RegisterWorkflowEndpointRequest,
  CheckRegistrationEndpointRequest,
  CheckRegistrationEndpointResponse,
  ConnectTelegramEndpointRequest,
  ConnectTelegramEndpointResponse,
  UpdateTimeSettingsEndpointRequest,
  UpdateTimeSettingsEndpointResponse,
  DisconnectTelegramEndpointRequest,
  DisconnectTelegramEndpointResponse,
  RemoveRegistrationEndpointRequest,
  RemoveRegistrationEndpointResponse,
  GetPublicStatusEndpointResponse,
  TogglePublicStatusEndpointResponse,
  TogglePublicStatusEndpointRequest,
} from "../../backend/dist/routing";

const host = "https://api.incaseofmy.de:443";

const fetchJson = async <T>(...params: Parameters<typeof fetch>) =>
  (await (await fetch(...params)).json()) as T;

export const beginAuth = async () => {
  const response = await fetchJson<BeginAuthEndpointResponse>(
    `${host}/v1/auth/begin`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data.url;
};

export const finishAuth = async (code: string, state: string) => {
  const response = await fetchJson<FinishAuthEndpointResponse>(
    `${host}/v1/auth/finish?code=${code}&state=${state}`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const findInstallation = async (uToken: string) => {
  const response = await fetchJson<FindInstallationEndpointResponse>(
    `${host}/v1/installation/find`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uToken }),
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const listRepos = async (iToken: string, page: number) => {
  const response = await fetchJson<ListReposEndpointResponse>(
    `${host}/v1/repos/list?iToken=${iToken}&page=${page}`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const listWorkflows = async (
  iToken: string,
  owner: string,
  repo: string,
  page: number
) => {
  const response = await fetchJson<ListWorkflowsEndpointResponse>(
    `${host}/v1/workflows/list?iToken=${iToken}&owner=${owner}&repo=${repo}&page=${page}`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const registerWorkflow = async (
  request: RegisterWorkflowEndpointRequest
) => {
  const response = await fetchJson<RegisterWorkflowEndpointResponse>(
    `${host}/v1/workflows/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const checkRegistration = async ({
  userId,
  iToken,
}: CheckRegistrationEndpointRequest) => {
  const response = await fetchJson<CheckRegistrationEndpointResponse>(
    `${host}/v1/registration/check?userId=${userId}&iToken=${iToken}`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const connectTelegram = async (
  request: ConnectTelegramEndpointRequest
) => {
  const response = await fetchJson<ConnectTelegramEndpointResponse>(
    `${host}/v1/channels/telegram/connect`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const updateTimeSettings = async (
  request: UpdateTimeSettingsEndpointRequest
) => {
  const response = await fetchJson<UpdateTimeSettingsEndpointResponse>(
    `${host}/v1/time/update`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const disconnectTelegram = async ({
  userId,
  uToken,
}: DisconnectTelegramEndpointRequest) => {
  const response = await fetchJson<DisconnectTelegramEndpointResponse>(
    `${host}/v1/channels/telegram/disconnect?userId=${userId}&uToken=${uToken}`,
    {
      method: "DELETE",
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const removeRegistration = async ({
  userId,
  uToken,
}: RemoveRegistrationEndpointRequest) => {
  const response = await fetchJson<RemoveRegistrationEndpointResponse>(
    `${host}/v1/registration/remove?userId=${userId}&uToken=${uToken}`,
    {
      method: "DELETE",
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const getPublicStatus = async (userId: number) => {
  const response = await fetchJson<GetPublicStatusEndpointResponse>(
    `${host}/v1/status/${userId}`
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};

export const setPublicStatus = async (
  request: TogglePublicStatusEndpointRequest
) => {
  const response = await fetchJson<TogglePublicStatusEndpointResponse>(
    `${host}/v1/registration/public`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (response.status === "error") {
    throw new Error(response.error.message);
  }
  return response.data;
};
