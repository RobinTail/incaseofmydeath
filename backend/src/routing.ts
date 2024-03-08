import { Routing } from "express-zod-api";
import { checkRegistrationEndpoint } from "./endpoints/check-registration.js";
import { connectTelegramEndpoint } from "./endpoints/connect-telegram.js";
import { disconnectTelegramEndpoint } from "./endpoints/disconnect-telegram.js";
import { findInstallationEndpoint } from "./endpoints/find-installation.js";
import { finishAuthenticationEndpoint } from "./endpoints/finish-auth.js";
import { beginAuthenticationEndpoint } from "./endpoints/begin-auth.js";
import { getPublicStatusByLoginEndpoint } from "./endpoints/get-public-status.js";
import { listRepositoriesEndpoint } from "./endpoints/list-repositories.js";
import { listWorkflowsEndpoint } from "./endpoints/list-workflows.js";
import { togglePublicStatusEndpoint } from "./endpoints/toggle-public-status.js";
import { registerWorkflowEndpoint } from "./endpoints/register-workflow.js";
import { removeRegistrationEndpoint } from "./endpoints/remove-registration.js";
import { updateTimeSettingsEndpoint } from "./endpoints/update-time-settings.js";

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
  },
  v2: {
    status: {
      ":login": getPublicStatusByLoginEndpoint,
    },
  },
};
