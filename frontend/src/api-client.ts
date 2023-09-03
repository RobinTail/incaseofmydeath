type GetV1AuthBeginInput = {} & {};

type GetV1AuthBeginResponse =
  | {
      status: "success";
      data: {
        url: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV1AuthFinishInput = {
  code: string;
  state?: string | undefined;
};

type GetV1AuthFinishResponse =
  | {
      status: "success";
      data: {
        id: number;
        login: string;
        avatarUrl?: string | undefined;
        name: string | null;
        uToken: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV1RegistrationCheckInput = ({
  userId: number | string;
} & {
  iToken: string;
}) & {};

type GetV1RegistrationCheckResponse =
  | {
      status: "success";
      data: {
        isAlive: boolean;
        isPublic: boolean;
        checkFreq: "day" | "week" | "month" | "quarter" | "year";
        deadlineDays: number;
        attemptsCount: number;
        nextCheck: string;
        repo: {
          owner: string;
          name: string;
        };
        workflow: {
          id: number;
          name: string;
        };
        channels: {
          telegram: {
            connected: boolean;
          };
        };
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type DeleteV1RegistrationRemoveInput = (({
  uToken: string;
  userId: number | string;
} & {}) & {}) & {};

type DeleteV1RegistrationRemoveResponse =
  | {
      status: "success";
      data: {};
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type PatchV1RegistrationPublicInput = (({
  uToken: string;
  userId: number | string;
} & {}) & {}) & {
  isPublic: boolean;
};

type PatchV1RegistrationPublicResponse =
  | {
      status: "success";
      data: {};
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type PatchV1TimeUpdateInput = (({
  uToken: string;
  userId: number | string;
} & {}) & {}) & {
  checkFreq: "day" | "week" | "month" | "quarter" | "year";
  deadlineDays: number;
  attemptsCount: number;
};

type PatchV1TimeUpdateResponse =
  | {
      status: "success";
      data: {
        nextCheck: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type PostV1ChannelsTelegramConnectInput = (({
  uToken: string;
  userId: number | string;
} & {}) & {}) & {
  chatId: string;
  hash: string;
  dataCheckString: string;
};

type PostV1ChannelsTelegramConnectResponse =
  | {
      status: "success";
      data: {
        userId: number;
        chatId: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type DeleteV1ChannelsTelegramDisconnectInput = (({
  uToken: string;
  userId: number | string;
} & {}) & {}) & {};

type DeleteV1ChannelsTelegramDisconnectResponse =
  | {
      status: "success";
      data: {};
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type PostV1InstallationFindInput = {} & {
  uToken: string;
};

type PostV1InstallationFindResponse =
  | {
      status: "success";
      data: {
        id: number;
        iToken: string;
        expiresAt: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV1ReposListInput = ({
  iToken: string;
} & {}) & {
  page: string;
};

type GetV1ReposListResponse =
  | {
      status: "success";
      data: {
        repositories: {
          login: string;
          name: string;
          isPrivate: boolean;
        }[];
        hasMore: boolean;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV1WorkflowsListInput = ({
  iToken: string;
} & {}) & {
  owner: string;
  repo: string;
  page: string;
};

type GetV1WorkflowsListResponse =
  | {
      status: "success";
      data: {
        hasMore: boolean;
        workflows: {
          id: number;
          name: string;
        }[];
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type PostV1WorkflowsRegisterInput = ({
  iToken: string;
} & {}) & {
  installationId: number;
  owner: string;
  repo: string;
  workflowId: number;
};

type PostV1WorkflowsRegisterResponse =
  | {
      status: "success";
      data: {
        userId: number;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV1StatusUseridInput = {
  userId: number | string;
} & {};

type GetV1StatusUseridResponse =
  | {
      status: "success";
      data: {
        login: string;
        avatarUrl?: string | undefined;
        name: string | null;
        isAlive: boolean;
        lastConfirmation: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

type GetV2StatusLoginInput = {
  login: string;
} & {};

type GetV2StatusLoginResponse =
  | {
      status: "success";
      data: {
        login: string;
        avatarUrl?: string | undefined;
        name: string | null;
        isAlive: boolean;
        lastConfirmation: string;
      };
    }
  | {
      status: "error";
      error: {
        message: string;
      };
    };

export type Path =
  | "/v1/auth/begin"
  | "/v1/auth/finish"
  | "/v1/registration/check"
  | "/v1/registration/remove"
  | "/v1/registration/public"
  | "/v1/time/update"
  | "/v1/channels/telegram/connect"
  | "/v1/channels/telegram/disconnect"
  | "/v1/installation/find"
  | "/v1/repos/list"
  | "/v1/workflows/list"
  | "/v1/workflows/register"
  | "/v1/status/:userId"
  | "/v2/status/:login";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export type MethodPath = `${Method} ${Path}`;

export interface Input extends Record<MethodPath, any> {
  "get /v1/auth/begin": GetV1AuthBeginInput;
  "get /v1/auth/finish": GetV1AuthFinishInput;
  "get /v1/registration/check": GetV1RegistrationCheckInput;
  "delete /v1/registration/remove": DeleteV1RegistrationRemoveInput;
  "patch /v1/registration/public": PatchV1RegistrationPublicInput;
  "patch /v1/time/update": PatchV1TimeUpdateInput;
  "post /v1/channels/telegram/connect": PostV1ChannelsTelegramConnectInput;
  "delete /v1/channels/telegram/disconnect": DeleteV1ChannelsTelegramDisconnectInput;
  "post /v1/installation/find": PostV1InstallationFindInput;
  "get /v1/repos/list": GetV1ReposListInput;
  "get /v1/workflows/list": GetV1WorkflowsListInput;
  "post /v1/workflows/register": PostV1WorkflowsRegisterInput;
  "get /v1/status/:userId": GetV1StatusUseridInput;
  "get /v2/status/:login": GetV2StatusLoginInput;
}

export interface Response extends Record<MethodPath, any> {
  "get /v1/auth/begin": GetV1AuthBeginResponse;
  "get /v1/auth/finish": GetV1AuthFinishResponse;
  "get /v1/registration/check": GetV1RegistrationCheckResponse;
  "delete /v1/registration/remove": DeleteV1RegistrationRemoveResponse;
  "patch /v1/registration/public": PatchV1RegistrationPublicResponse;
  "patch /v1/time/update": PatchV1TimeUpdateResponse;
  "post /v1/channels/telegram/connect": PostV1ChannelsTelegramConnectResponse;
  "delete /v1/channels/telegram/disconnect": DeleteV1ChannelsTelegramDisconnectResponse;
  "post /v1/installation/find": PostV1InstallationFindResponse;
  "get /v1/repos/list": GetV1ReposListResponse;
  "get /v1/workflows/list": GetV1WorkflowsListResponse;
  "post /v1/workflows/register": PostV1WorkflowsRegisterResponse;
  "get /v1/status/:userId": GetV1StatusUseridResponse;
  "get /v2/status/:login": GetV2StatusLoginResponse;
}

export const jsonEndpoints = {
  "get /v1/auth/begin": true,
  "get /v1/auth/finish": true,
  "get /v1/registration/check": true,
  "delete /v1/registration/remove": true,
  "patch /v1/registration/public": true,
  "patch /v1/time/update": true,
  "post /v1/channels/telegram/connect": true,
  "delete /v1/channels/telegram/disconnect": true,
  "post /v1/installation/find": true,
  "get /v1/repos/list": true,
  "get /v1/workflows/list": true,
  "post /v1/workflows/register": true,
  "get /v1/status/:userId": true,
  "get /v2/status/:login": true,
};

export const endpointTags = {
  "get /v1/auth/begin": [],
  "get /v1/auth/finish": [],
  "get /v1/registration/check": [],
  "delete /v1/registration/remove": [],
  "patch /v1/registration/public": [],
  "patch /v1/time/update": [],
  "post /v1/channels/telegram/connect": [],
  "delete /v1/channels/telegram/disconnect": [],
  "post /v1/installation/find": [],
  "get /v1/repos/list": [],
  "get /v1/workflows/list": [],
  "post /v1/workflows/register": [],
  "get /v1/status/:userId": [],
  "get /v2/status/:login": [],
};

export type Provider = <M extends Method, P extends Path>(
  method: M,
  path: P,
  params: Input[`${M} ${P}`],
) => Promise<Response[`${M} ${P}`]>;

export type Implementation = (
  method: Method,
  path: string,
  params: Record<string, any>,
) => Promise<any>;

/*
export const exampleImplementation: Implementation = async (
  method,
  path,
  params
) => {
  const hasBody = !["get", "delete"].includes(method);
  const searchParams = hasBody ? "" : `?${new URLSearchParams(params)}`;
  const response = await fetch(`https://example.com${path}${searchParams}`, {
    method: method.toUpperCase(),
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(params) : undefined,
  });
  if (`${method} ${path}` in jsonEndpoints) {
    return response.json();
  }
  return response.text();
};

const client = new ExpressZodAPIClient(exampleImplementation);
client.provide("get", "/v1/user/retrieve", { id: "10" });
*/
export class ExpressZodAPIClient {
  constructor(protected readonly implementation: Implementation) {}
  public readonly provide: Provider = async (method, path, params) =>
    this.implementation(
      method,
      Object.keys(params).reduce(
        (acc, key) => acc.replace(`:${key}`, params[key]),
        path,
      ),
      Object.keys(params).reduce(
        (acc, key) =>
          path.indexOf(`:${key}`) >= 0 ? acc : { ...acc, [key]: params[key] },
        {},
      ),
    );
}
