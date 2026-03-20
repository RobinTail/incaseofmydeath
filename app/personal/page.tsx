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
  Select,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Person } from "@/components/Person";
import { UserStatus } from "@/components/UserStatus";

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

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("auth_token="));
    const authDataCookie = cookies.find((row) => row.startsWith("auth_data="));

    const tokenValue = authCookie?.split("=")[1];
    let authData: AuthData | null = null;

    if (authDataCookie) {
      try {
        authData = JSON.parse(decodeURIComponent(authDataCookie.split("=")[1]));
      } catch {
        // ignore parse errors
      }
    }

    if (!tokenValue) {
      router.push("/");
      return;
    }

    setToken(tokenValue);
    setAuth(authData);
    fetchStatus(tokenValue);
  }, [router]);

  async function fetchStatus(t: string) {
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
  }

  async function fetchRepos(t: string) {
    try {
      const res = await fetch("/api/repos/list", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setRepos(data.repos || []);
    } catch {
      // ignore
    }
  }

  async function fetchWorkflows(t: string, owner: string, repo: string) {
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
  }

  async function handleRegister() {
    if (!token || !selectedRepo || !selectedWorkflow) return;
    setSaving(true);

    const [owner, name] = selectedRepo.split("/");
    try {
      const res = await fetch("/api/workflows/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo: name,
          workflowId: selectedWorkflow,
        }),
      });
      if (!res.ok) throw new Error("Failed to register");
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

  async function handleUpdateSettings() {
    if (!token) return;
    setSaving(true);
    try {
      await fetch("/api/time", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkFreq,
          deadlineDays,
          attemptsCount,
        }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "auth_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

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

              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={!selectedRepo || !selectedWorkflow || saving}
                fullWidth
                sx={{ mb: 2 }}
              >
                {saving ? <CircularProgress size={24} /> : "Register Workflow"}
              </Button>
            </>
          )}

          {isRegistered && status && (
            <>
              <Card sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Registered Workflow
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Repository: {status.repo?.owner}/{status.repo?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Check Frequency: {status.checkFreq}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deadline: {status.deadlineDays} days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attempts: {status.attemptsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next Check:{" "}
                    {new Date(status.nextCheck).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Settings
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Check Frequency:
                    </Typography>
                    <Select
                      value={checkFreq}
                      onChange={(e) => setCheckFreq(e.target.value)}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="day">Daily</MenuItem>
                      <MenuItem value="week">Weekly</MenuItem>
                      <MenuItem value="month">Monthly</MenuItem>
                      <MenuItem value="quarter">Quarterly</MenuItem>
                      <MenuItem value="year">Yearly</MenuItem>
                    </Select>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Deadline (days): {deadlineDays}
                    </Typography>
                    <TextField
                      type="number"
                      value={deadlineDays}
                      onChange={(e) => setDeadlineDays(Number(e.target.value))}
                      inputProps={{ min: 1, max: 30 }}
                      fullWidth
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Attempts: {attemptsCount}
                    </Typography>
                    <TextField
                      type="number"
                      value={attemptsCount}
                      onChange={(e) => setAttemptsCount(Number(e.target.value))}
                      inputProps={{ min: 1, max: 10 }}
                      fullWidth
                      size="small"
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    onClick={handleUpdateSettings}
                    disabled={saving}
                    fullWidth
                  >
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Update Settings"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card sx={{ width: "100%", mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Telegram Channel
                  </Typography>
                  {status.channels.telegram.connected ? (
                    <>
                      <Chip
                        icon={<Icon>check_circle</Icon>}
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
                        icon={<Icon>cancel</Icon>}
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
                  <Typography variant="h6" gutterBottom>
                    Public Status
                  </Typography>
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
    </>
  );
}
