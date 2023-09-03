import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import React from "react";
import { CopyToClipboardButton } from "react-clipboard-button";
import { useSearchParams } from "react-router-dom";
import useLocalStorageState from "use-local-storage-state";
import {
  beginAuth,
  checkRegistration,
  findInstallation,
  finishAuth,
  listRepos,
  listWorkflows,
  registerWorkflow,
  setPublicStatus,
} from "./api";
import { z } from "zod";
import { Channels } from "./Channels";
import { Consent } from "./Consent";
import { SnackbarContext } from "./context";
import { IconicListSelector } from "./IconicListSelector";
import { paths, replacePathsParams } from "./paths";
import { Person } from "./Person";
import { UserStatus } from "./UserStatus";
import { SettingsDialog } from "./SettingsDialog";
import { TimeSliders } from "./TimeSliders";
import { WorkflowExample } from "./WorkflowExample";

type Auth = Awaited<ReturnType<typeof finishAuth>>;
type Installation = Awaited<ReturnType<typeof findInstallation>>;
type Registration = Awaited<ReturnType<typeof checkRegistration>>;
type Repo = Awaited<ReturnType<typeof listRepos>>["repositories"][number];
type Workflow = Awaited<ReturnType<typeof listWorkflows>>["workflows"][number];

const ensureAuth = (value: unknown): Auth | null => {
  try {
    return z
      .object({
        id: z.number().int().positive(),
        login: z.string().min(1),
        avatarUrl: z.string().optional(),
        name: z.string().nullable(),
        uToken: z.string().min(1),
      })
      .or(z.null())
      .parse(value);
  } catch (e) {
    return null;
  }
};

const ensureInstallation = (value: unknown): Installation | null => {
  try {
    return z
      .object({
        id: z.number().int().positive(),
        iToken: z.string().min(1),
        expiresAt: z.string().min(1),
      })
      .or(z.null())
      .parse(value);
  } catch (e) {
    return null;
  }
};

const PersonalArea = () => {
  const { showSnackbar } = React.useContext(SnackbarContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [_auth, setAuth, { isPersistent }] = useLocalStorageState<unknown>(
    "auth",
    { defaultValue: null },
  );
  const [_installation, setInstallation] = useLocalStorageState<unknown>(
    "installation",
    { defaultValue: null },
  );
  const [registration, setRegistration] = React.useState<
    Registration | null | false
  >(null); // null - status unknown yet, false - not registered
  const [nextRepoPage, setNextRepoPage] = React.useState<number | null>(1);
  const [repos, setRepos] = React.useState<Repo[]>([]);
  const [nextWfPage, setNextWfPage] = React.useState<number | null>(1);
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [selectedRepo, setSelectedRepo] = React.useState<Repo | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<Workflow | null>(null);
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);

  const [params, setParams] = useSearchParams();

  const auth = React.useMemo(() => ensureAuth(_auth), [_auth]);
  const installation = React.useMemo(
    () => ensureInstallation(_installation),
    [_installation],
  );

  const isAuthorized = auth !== null;
  const isInstalled = installation !== null;
  const isNotRegistered = registration === false;
  const isRepoSelected = selectedRepo !== null;
  const isWorkflowSelected = selectedWorkflow !== null;
  const hasMoreRepos = nextRepoPage !== null;
  const hasMoreWorkflows = nextWfPage !== null;

  const code = params.get("code");
  const state = params.get("state"); // optional

  const runAsync = (
    cb: () => Promise<void>,
    options?: { infinite: boolean },
  ) => {
    setIsLoading(true);
    (async () => {
      try {
        await cb();
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
          if (options?.infinite) {
            setIsLoading(false);
          }
        }
      }
      if (!options?.infinite) {
        setIsLoading(false);
      }
    })();
  };

  // code -> auth
  React.useEffect(() => {
    if (code) {
      runAsync(async () => {
        setAuth(await finishAuth(code, state || ""));
        setParams({}, { replace: true });
      });
    }
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  // auth -> installation
  React.useEffect(() => {
    if (isAuthorized && !isInstalled) {
      runAsync(async () => {
        try {
          setInstallation(await findInstallation(auth.uToken));
        } catch (e) {
          logout();
        }
      });
    }
  }, [isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

  // installation.iToken actualization fn
  const ensureInstallationToken = async () => {
    const expiresAt = isInstalled
      ? new Date(installation.expiresAt).valueOf() - 60000 // one minute before the expiration
      : 0;
    const isValid = expiresAt > new Date().valueOf();
    if (isValid && isInstalled) {
      return installation.iToken;
    }
    if (isAuthorized) {
      try {
        const newInstallation = await findInstallation(auth.uToken);
        setInstallation(newInstallation);
        return newInstallation.iToken;
      } catch (e) {
        logout();
      }
    }
    throw new Error(
      "should not call ensureInstallationToken() when !isAuthorized.",
    );
  };

  // registration checking fn
  const registrationChecker = async () => {
    if (isAuthorized && isInstalled) {
      try {
        const resp = await checkRegistration({
          userId: auth.id,
          iToken: await ensureInstallationToken(),
        });
        setRegistration(resp);
      } catch (e) {
        setRegistration(false);
      }
    }
  };

  const reposLoader = async () => {
    if (!nextRepoPage) {
      return;
    }
    const resp = await listRepos(await ensureInstallationToken(), nextRepoPage);
    setRepos(repos.concat(resp.repositories));
    setNextRepoPage(resp.hasMore ? nextRepoPage + 1 : null);
  };

  const workflowsLoader = async () => {
    if (!nextWfPage || !isRepoSelected) {
      return;
    }
    const resp = await listWorkflows(
      await ensureInstallationToken(),
      selectedRepo.login,
      selectedRepo.name,
      nextWfPage,
    );
    setWorkflows(workflows.concat(resp.workflows));
    setNextWfPage(resp.hasMore ? nextWfPage + 1 : null);
  };

  // installation -> registration
  React.useEffect(
    () => {
      runAsync(registrationChecker);
    },
    [isInstalled], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // !registration -> repos
  React.useEffect(() => {
    if (isInstalled && isNotRegistered) {
      runAsync(reposLoader);
    }
  }, [registration]); // eslint-disable-line react-hooks/exhaustive-deps

  // repo -> workflows
  React.useEffect(() => {
    if (isInstalled && isRepoSelected && isNotRegistered) {
      runAsync(workflowsLoader);
    }
  }, [isRepoSelected, registration]); // eslint-disable-line react-hooks/exhaustive-deps

  // authorization starting button handler
  const authorize = () => {
    setError(null);
    runAsync(
      async () => {
        window.location.href = await beginAuth();
      },
      { infinite: true },
    );
  };

  const logout = () => {
    setRegistration(null);
    setInstallation(null);
    setAuth(null);
  };

  // consent and registration request handler
  const register = () => {
    setError(null);
    if (isInstalled && isRepoSelected && isWorkflowSelected) {
      runAsync(async () => {
        await registerWorkflow({
          installationId: installation.id,
          iToken: await ensureInstallationToken(),
          owner: selectedRepo.login,
          repo: selectedRepo.name,
          workflowId: selectedWorkflow.id,
        });
        await registrationChecker();
      });
    }
  };

  return (
    <>
      {/* Avatar or GitHub logo */}
      <Person
        isAuthorized={isAuthorized}
        isRegistered={!!registration}
        avatarUrl={auth?.avatarUrl}
        login={auth?.login}
        name={auth?.name}
        isPersistent={isPersistent}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <Box sx={{ mt: 1, mb: 4 }} textAlign="center">
        {/* Required action description */}
        <UserStatus
          isAuthorized={isAuthorized}
          isRegistered={registration ? !!registration : registration}
          isRepoSelected={isRepoSelected}
          isWorkflowSelected={isWorkflowSelected}
          isLoading={isLoading}
          isAlive={registration && registration.isAlive}
        />

        {isAuthorized && !!registration && (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={registration.isPublic}
                  onChange={async () => {
                    try {
                      await setPublicStatus({
                        uToken: auth.uToken,
                        userId: auth.id,
                        isPublic: !registration.isPublic,
                      });
                      setRegistration({
                        ...registration,
                        isPublic: !registration.isPublic,
                      });
                    } catch (e) {
                      if (e instanceof Error) {
                        showSnackbar({ message: e.message, success: false });
                      }
                    }
                  }}
                />
              }
              label="Public status"
            />
            <CopyToClipboardButton
              text={
                `${window.location.protocol}//${window.location.host}` +
                replacePathsParams(paths.publicStatus, {
                  login: `${auth.login}`,
                })
              }
              onSuccess={() =>
                showSnackbar({ message: "Copied!", success: true })
              }
              onError={() =>
                showSnackbar({ message: "Failed to copy", success: false })
              }
            >
              <Tooltip title="Copy URL" placement="right" arrow>
                <IconButton>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </CopyToClipboardButton>
          </Box>
        )}

        <SettingsDialog
          open={isSettingsOpen}
          onClose={() => setSettingsOpen(false)}
          onRemoveRegistration={logout}
          userId={isAuthorized && registration ? auth.id : null}
          uToken={isAuthorized && registration ? auth.uToken : null}
          repo={isAuthorized && registration ? registration.repo : null}
          workflow={isAuthorized && registration ? registration.workflow : null}
        />

        {/* Listing repositories */}
        {isAuthorized && isNotRegistered && !isRepoSelected && (
          <IconicListSelector
            isLoading={isLoading}
            icon={<GitHubIcon />}
            items={repos.map((repo) => ({
              key: `${repo.login}/${repo.name}`,
              badge: {
                color: repo.isPrivate ? "success" : "warning",
                content: repo.isPrivate ? "private" : "public",
              },
              primary: repo.name,
              secondary: repo.login,
              onClick: () => setSelectedRepo(repo),
            }))}
          />
        )}

        {/* Listing workflows */}
        {isAuthorized &&
          isNotRegistered &&
          isRepoSelected &&
          !isWorkflowSelected && (
            <IconicListSelector
              isLoading={isLoading}
              icon={<PlayCircleOutlineIcon />}
              items={workflows.map((workflow) => ({
                key: workflow.id,
                primary: workflow.name,
                secondary: selectedRepo.name,
                onClick: () => setSelectedWorkflow(workflow),
              }))}
            />
          )}

        {/* Consent */}
        {isAuthorized &&
          isRepoSelected &&
          isWorkflowSelected &&
          isNotRegistered && (
            <Consent
              signedBy={auth.name || `GitHub user ${auth.login}`}
              repo={`${selectedRepo.login} / ${selectedRepo.name}`}
              workflow={selectedWorkflow.name}
              isLoading={isLoading}
              onAgree={register}
              onReset={() => {
                setSelectedWorkflow(null);
                setSelectedRepo(null);
              }}
            />
          )}

        {/* More repos button */}
        {isAuthorized && isNotRegistered && !isRepoSelected && hasMoreRepos && (
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={reposLoader}
          >
            More Repos
          </Button>
        )}

        {/* More workflows button */}
        {isAuthorized &&
          isNotRegistered &&
          isRepoSelected &&
          !isWorkflowSelected &&
          hasMoreWorkflows && (
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={workflowsLoader}
            >
              More Workflows
            </Button>
          )}

        {/* Start button */}
        {!isAuthorized && (
          <Button
            disabled={isLoading}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={authorize}
            endIcon={isLoading && <CircularProgress size="1.5rem" />}
          >
            Let's Begin
          </Button>
        )}

        {/* Permissions button */}
        {isAuthorized && isInstalled && isNotRegistered && !isRepoSelected && (
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            href={`https://github.com/settings/installations/${installation.id}`}
          >
            Adjust Permissions
          </Button>
        )}

        {/* Repo reset button */}
        {isAuthorized &&
          isRepoSelected &&
          isNotRegistered &&
          !isWorkflowSelected && (
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              onClick={() => {
                setSelectedRepo(null);
                setWorkflows([]);
                setNextWfPage(1);
              }}
            >
              Another repository
            </Button>
          )}

        {/* Error alert */}
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      {/* Time interval settings */}
      {isAuthorized && registration && (
        <TimeSliders
          userId={auth.id}
          uToken={auth.uToken}
          checkFreqCode={registration.checkFreq}
          deadlineDays={registration.deadlineDays}
          attemptsCount={registration.attemptsCount}
          nextCheck={new Date(registration.nextCheck)}
        />
      )}

      {/* Channels */}
      {isAuthorized && registration && (
        <Channels
          userId={auth.id}
          uToken={auth.uToken}
          channels={registration.channels}
          onChange={registrationChecker}
        />
      )}

      {/* Workflow example */}
      {isAuthorized &&
        isInstalled &&
        isNotRegistered &&
        !isWorkflowSelected && <WorkflowExample mt={0} />}
    </>
  );
};

export default PersonalArea;
