import { EndpointInput, EndpointResponse, Routing } from "express-zod-api";
import { checkRegistrationEndpoint } from "./endpoints/check-registration";
import { connectTelegramEndpoint } from "./endpoints/connect-telegram";
import { disconnectTelegramEndpoint } from "./endpoints/disconnect-telegram";
import { findInstallationEndpoint } from "./endpoints/find-installation";
import { finishAuthenticationEndpoint } from "./endpoints/finish-auth";
import { beginAuthenticationEndpoint } from "./endpoints/begin-auth";
import { getPublicStatusEndpoint } from "./endpoints/get-public-status";
import { listRepositoriesEndpoint } from "./endpoints/list-repositories";
import { listWorkflowsEndpoint } from "./endpoints/list-workflows";
import { togglePublicStatusEndpoint } from "./endpoints/toggle-public-status";
import { registerWorkflowEndpoint } from "./endpoints/register-workflow";
import { removeRegistrationEndpoint } from "./endpoints/remove-registration";
import { updateTimeSettingsEndpoint } from "./endpoints/update-time-settings";

export const routing: Routing = {
  v1: {
    auth: {
      begin: beginAuthenticationEndpoint,
      finish: finishAuthenticationEndpoint,
    },
    registration: {
      check: checkRegistrationEndpoint,
      remove: removeRegistrationEndpoint,
      public: togglePublicStatusEndpoint,
    },
    time: {
      update: updateTimeSettingsEndpoint,
    },
    channels: {
      telegram: {
        connect: connectTelegramEndpoint,
        disconnect: disconnectTelegramEndpoint,
      },
    },
    installation: {
      find: findInstallationEndpoint,
    },
    repos: {
      list: listRepositoriesEndpoint,
    },
    workflows: {
      list: listWorkflowsEndpoint,
      register: registerWorkflowEndpoint,
    },
    status: {
      ":userId": getPublicStatusEndpoint,
    },
  },
};

export type BeginAuthEndpointResponse = EndpointResponse<
  typeof beginAuthenticationEndpoint
>;
export type FinishAuthEndpointResponse = EndpointResponse<
  typeof finishAuthenticationEndpoint
>;
export type FindInstallationEndpointResponse = EndpointResponse<
  typeof findInstallationEndpoint
>;
export type ListReposEndpointResponse = EndpointResponse<
  typeof listRepositoriesEndpoint
>;
export type ListWorkflowsEndpointResponse = EndpointResponse<
  typeof listWorkflowsEndpoint
>;
export type RegisterWorkflowEndpointResponse = EndpointResponse<
  typeof registerWorkflowEndpoint
>;
export type RegisterWorkflowEndpointRequest = EndpointInput<
  typeof registerWorkflowEndpoint
>;
export type CheckRegistrationEndpointRequest = EndpointInput<
  typeof checkRegistrationEndpoint
>;
export type CheckRegistrationEndpointResponse = EndpointResponse<
  typeof checkRegistrationEndpoint
>;
export type ConnectTelegramEndpointRequest = EndpointInput<
  typeof connectTelegramEndpoint
>;
export type ConnectTelegramEndpointResponse = EndpointResponse<
  typeof connectTelegramEndpoint
>;
export type UpdateTimeSettingsEndpointRequest = EndpointInput<
  typeof updateTimeSettingsEndpoint
>;
export type UpdateTimeSettingsEndpointResponse = EndpointResponse<
  typeof updateTimeSettingsEndpoint
>;
export type DisconnectTelegramEndpointRequest = EndpointInput<
  typeof disconnectTelegramEndpoint
>;
export type DisconnectTelegramEndpointResponse = EndpointResponse<
  typeof disconnectTelegramEndpoint
>;
export type RemoveRegistrationEndpointRequest = EndpointInput<
  typeof removeRegistrationEndpoint
>;
export type RemoveRegistrationEndpointResponse = EndpointResponse<
  typeof removeRegistrationEndpoint
>;
export type GetPublicStatusEndpointResponse = EndpointResponse<
  typeof getPublicStatusEndpoint
>;
export type TogglePublicStatusEndpointRequest = EndpointInput<
  typeof togglePublicStatusEndpoint
>;
export type TogglePublicStatusEndpointResponse = EndpointResponse<
  typeof togglePublicStatusEndpoint
>;
