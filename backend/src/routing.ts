import { Routing } from "express-zod-api";
import { checkRegistrationEndpoint } from "./endpoints/check-registration";
import { connectTelegramEndpoint } from "./endpoints/connect-telegram";
import { disconnectTelegramEndpoint } from "./endpoints/disconnect-telegram";
import { findInstallationEndpoint } from "./endpoints/find-installation";
import { finishAuthenticationEndpoint } from "./endpoints/finish-auth";
import { beginAuthenticationEndpoint } from "./endpoints/begin-auth";
import {
  getPublicStatusByIdEndpoint,
  getPublicStatusByLoginEndpoint,
} from "./endpoints/get-public-status";
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
      /** @deprecated use /v2/status/:login instead */
      ":userId": getPublicStatusByIdEndpoint,
    },
  },
  v2: {
    status: {
      ":login": getPublicStatusByLoginEndpoint,
    },
  },
};
