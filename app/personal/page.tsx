"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Icon,
  IconButton,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Person } from "@/components/Person";
import { UserStatus } from "@/components/UserStatus";
import { Consent } from "@/components/Consent";
import { TimeSliders } from "@/components/TimeSliders";
import { SettingsDialog } from "@/components/SettingsDialog";

interface AuthData {
  id: number;
  login: string;
  avatarUrl?: string;
  name?: string | null;
}

interface RegistrationStatus {
  isRegistered: boolean;
  isAlive: boolean;
  isPublic: boolean;
  checkFreq: string;
  deadlineDays: number;
  attemptsCount: number;
  nextCheck: string;
  repo: { owner: string; name: string } | null;
  workflow: { id: number; name: string } | null;
  channels: { telegram: { connected: boolean } };
}

interface Repo {
  owner: string;
  name: string;
  private: boolean;
}

interface Workflow {
  id: number;
  name: string;
}

export default function PersonalPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [checkFreq, setCheckFreq] = useState("month");
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [attemptsCount, setAttemptsCount] = useState(3);
  const [showConsent, setShowConsent] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    owner: string;
    name: string;
    workflowId: number;
    workflowName: string;
  } | null>(null);

  const fetchRepos = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/repos/list", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setRepos(data.repos || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchWorkflows = useCallback(
    async (t: string, owner: string, repo: string) => {
      try {
        const res = await fetch(
          `/api/workflows/list?owner=${owner}&repo=${repo}`,
          {
            headers: { Authorization: `Bearer ${t}` },
          },
        );
        const data = await res.json();
        setWorkflows(data.workflows || []);
      } catch {
        // ignore
      }
    },
    [],
  );

  const fetchStatus = useCallback(
    async (t: string) => {
      try {
        const res = await fetch("/api/registration/check", {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = await res.json();
        setStatus(data);
        if (data.isRegistered) {
          setCheckFreq(data.checkFreq);
          setDeadlineDays(data.deadlineDays);
          setAttemptsCount(data.attemptsCount);
        } else {
          fetchRepos(t);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [fetchRepos],
  );

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("auth_token="));
    const authDataCookie = cookies.find((row) => row.startsWith("auth_data="));

    const tokenValue = authCookie?.split("=").slice(1).join("=");
    let authData: AuthData | null = null;

    if (authDataCookie) {
      try {
        const value = authDataCookie.split("=").slice(1).join("=");
        authData = JSON.parse(atob(value));
      } catch (e) {
        console.error("Failed to parse auth_data cookie", e);
      }
    }

    if (!tokenValue) {
      router.push("/");
      return;
    }

    setToken(tokenValue);
    setAuth(authData);
    fetchStatus(tokenValue);
  }, [router, fetchStatus]);

  async function handleRegister() {
    if (!token || !pendingRegistration) return;
    setSaving(true);

    try {
      const res = await fetch("/api/workflows/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner: pendingRegistration.owner,
          repo: pendingRegistration.name,
          workflowId: pendingRegistration.workflowId,
        }),
      });
      if (!res.ok) throw new Error("Failed to register");
      setShowConsent(false);
      setPendingRegistration(null);
      setSelectedRepo("");
      setSelectedWorkflow(null);
      setWorkflows([]);
      await fetchStatus(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to register");
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublic() {
    if (!token || !status) return;
    setSaving(true);
    try {
      await fetch("/api/registration/public", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !status.isPublic }),
      });
      setStatus({ ...status, isPublic: !status.isPublic });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnectTelegram() {
    if (!token) return;
    setSaving(true);
    try {
      await fetch("/api/channels/telegram/disconnect", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status) {
        setStatus({
          ...status,
          channels: { telegram: { connected: false } },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disconnect");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSettings(
    newCheckFreq: string,
    newDeadlineDays: number,
    newAttemptsCount: number
  ) {
    if (!token) return;
    try {
      await fetch("/api/time", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkFreq: newCheckFreq,
          deadlineDays: newDeadlineDays,
          attemptsCount: newAttemptsCount,
        }),
      });
      setCheckFreq(newCheckFreq);
      setDeadlineDays(newDeadlineDays);
      setAttemptsCount(newAttemptsCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update settings");
    }
  }

  async function handleUnregister() {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch("/api/registration/remove", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to unregister");
      await fetchStatus(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unregister");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/status/${auth?.login}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !status) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  const isRegistered = status?.isRegistered ?? false;

  return (
    <>
      <Header />
      <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          <Person
            isAuthorized={!!auth}
            isRegistered={isRegistered}
            avatarUrl={auth?.avatarUrl}
            login={auth?.login}
            name={auth?.name}
            onSettingsClick={() => setSettingsOpen(true)}
          />

          {status && <UserStatus isAlive={status.isAlive} />}

          {!isRegistered && (
            <>
              <Typography variant="h6" gutterBottom>
                Setup Your Last Will
              </Typography>
              <Typography mb={2} align="center">
                Select a repository and workflow to execute when you don&apos;t
                respond.
              </Typography>

              <Box sx={{ width: "100%", mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Repository:
                </Typography>
                <Select
                  value={selectedRepo}
                  onChange={(e) => {
                    setSelectedRepo(e.target.value);
                    setWorkflows([]);
                    setSelectedWorkflow(null);
                    if (token && e.target.value) {
                      const [owner, name] = e.target.value.split("/");
                      fetchWorkflows(token, owner, name);
                    }
                  }}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select a repository
                  </MenuItem>
                  {repos.map((r) => (
                    <MenuItem
                      key={`${r.owner}/${r.name}`}
                      value={`${r.owner}/${r.name}`}
                    >
                      {r.name} {r.private ? "(private)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ width: "100%", mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Workflow:
                </Typography>
                <Select
                  value={selectedWorkflow ?? ""}
                  onChange={(e) => setSelectedWorkflow(Number(e.target.value))}
                  fullWidth
                  displayEmpty
                  disabled={!selectedRepo}
                >
                  <MenuItem value="" disabled>
                    Select a workflow
                  </MenuItem>
                  {workflows.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {!showConsent ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (selectedRepo && selectedWorkflow) {
                      const [owner, name] = selectedRepo.split("/");
                      const workflow = workflows.find(
                        (w) => w.id === selectedWorkflow,
                      );
                      setPendingRegistration({
                        owner,
                        name,
                        workflowId: selectedWorkflow,
                        workflowName: workflow?.name || "Unknown",
                      });
                      setShowConsent(true);
                    }
                  }}
                  disabled={!selectedRepo || !selectedWorkflow || saving}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Continue to Consent
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowConsent(false);
                      setPendingRegistration(null);
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Back
                  </Button>
                  {pendingRegistration && (
                    <Consent
                      signedBy={auth?.name || auth?.login || "User"}
                      repo={`${pendingRegistration.owner}/${pendingRegistration.name}`}
                      workflow={pendingRegistration.workflowName}
                      isLoading={saving}
                      onAgree={handleRegister}
                      onReset={() => {
                        setShowConsent(false);
                        setPendingRegistration(null);
                        setSelectedRepo("");
                        setSelectedWorkflow(null);
                        setWorkflows([]);
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}

          {isRegistered && status && (
            <>
              <TimeSliders
                checkFreqCode={checkFreq as "day" | "week" | "month" | "quarter" | "year"}
                deadlineDays={deadlineDays}
                attemptsCount={attemptsCount}
                nextCheck={status?.nextCheck ? new Date(status.nextCheck) : new Date()}
                onUpdate={handleUpdateSettings}
              />

              <Card sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Telegram Channel
                  </Typography>
                  {status.channels.telegram.connected ? (
                    <>
                      <Chip
                        icon={<Icon className='material-symbols-outlined'>check_circle</Icon>}
                        label="Connected"
                        color="success"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDisconnectTelegram}
                        disabled={saving}
                        fullWidth
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <Chip
                        icon={<Icon className='material-symbols-outlined'>cancel</Icon>}
                        label="Not connected"
                        color="default"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        component={Link}
                        href="https://t.me/YourBot"
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                      >
                        Connect Telegram
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                      Public Status
                    </Typography>
                    {status.isPublic && (
                      <Tooltip title="Copy URL" placement="right" arrow>
                        <IconButton onClick={handleCopyUrl} size="small">
                          <Icon className="material-symbols-outlined">content_copy</Icon>
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={status.isPublic}
                        onChange={handleTogglePublic}
                        disabled={saving}
                      />
                    }
                    label="Make my status public"
                  />
                  {status.isPublic && (
                    <Typography variant="body2" color="text.secondary">
                      View at:{" "}
                      <Link href={`/status/${status.repo?.owner}`}>
                        /status/{status.repo?.owner}
                      </Link>
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <Button variant="text" onClick={handleLogout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Box>
      </Container>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUnregister={handleUnregister}
        isLoading={saving}
        repo={status?.repo || null}
        workflow={status?.workflow || null}
      />
    </>
  );
}
