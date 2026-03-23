'use client';

import {
  Alert,
  Box,
  Button,
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
  Stack,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Person } from '@/components/Person';
import { UserStatus } from '@/components/UserStatus';
import { Consent } from '@/components/Consent';
import { TimeSliders } from '@/components/TimeSliders';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Channels } from '@/components/Channels';

interface AuthData {
  id: number;
  login: string;
  avatarUrl?: string | null;
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

interface PersonalContentProps {
  auth: AuthData;
}

export function PersonalContent({ auth }: PersonalContentProps) {
  const router = useRouter();

  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [checkFreq, setCheckFreq] = useState('month');
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [attemptsCount, setAttemptsCount] = useState(3);
  const [showConsent, setShowConsent] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    owner: string;
    name: string;
    workflowId: number;
    workflowName: string;
  } | null>(null);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch('/api/repos/list');
      const data = await res.json();
      setRepos(data.repos || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchWorkflows = useCallback(async (owner: string, repo: string) => {
    try {
      const res = await fetch(`/api/workflows/list?owner=${owner}&repo=${repo}`);
      const data = await res.json();
      setWorkflows(data.workflows || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/registration/check');
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
      if (data.isRegistered) {
        setCheckFreq(data.checkFreq);
        setDeadlineDays(data.deadlineDays);
        setAttemptsCount(data.attemptsCount);
      } else {
        fetchRepos();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchRepos]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleRegister() {
    if (!pendingRegistration) return;
    setSaving(true);

    try {
      const res = await fetch('/api/workflows/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: pendingRegistration.owner,
          repo: pendingRegistration.name,
          workflowId: pendingRegistration.workflowId,
          workflowName: pendingRegistration.workflowName,
        }),
      });
      if (!res.ok) throw new Error('Failed to register');
      setShowConsent(false);
      setPendingRegistration(null);
      setSelectedRepo('');
      setSelectedWorkflow(null);
      setWorkflows([]);
      await fetchStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to register');
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePublic() {
    if (!status) return;
    setSaving(true);
    try {
      await fetch('/api/registration/public', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !status.isPublic }),
      });
      setStatus({ ...status, isPublic: !status.isPublic });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectTelegram(data: {
    id: number;
    hash: string;
    dataCheckString: string;
  }) {
    setSaving(true);
    try {
      await fetch('/api/channels/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (status) {
        setStatus({
          ...status,
          channels: { telegram: { connected: true } },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect');
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnectTelegram() {
    setSaving(true);
    try {
      await fetch('/api/channels/telegram/disconnect', { method: 'DELETE' });
      if (status) {
        setStatus({
          ...status,
          channels: { telegram: { connected: false } },
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to disconnect');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateSettings(
    newCheckFreq: string,
    newDeadlineDays: number,
    newAttemptsCount: number
  ) {
    try {
      await fetch('/api/time', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      setError(e instanceof Error ? e.message : 'Failed to update settings');
    }
  }

  async function handleUnregister() {
    setSaving(true);
    try {
      const res = await fetch('/api/registration/remove', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unregister');
      await fetchStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unregister');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/status/${auth.login}`;
    try {
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
        <Stack
          sx={{
            alignItems: 'center',
            gap: 3,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Person
            isAuthorized={true}
            isRegistered={isRegistered}
            avatarUrl={auth.avatarUrl}
            login={auth.login}
            name={auth.name}
            onSettingsClick={() => setSettingsOpen(true)}
          />

          {status && <UserStatus isAlive={status.isAlive} />}

          <Stack direction="row" alignItems="center" gap={1}>
            {status && (
              <FormControlLabel
                control={
                  <Switch size="small" checked={status.isPublic} onChange={handleTogglePublic} />
                }
                label={<span>Public status</span>}
              />
            )}

            {status?.isPublic && (
              <Tooltip title={urlCopied ? 'Copied!' : 'Copy Public URL'} arrow>
                <IconButton size="small" onClick={handleCopyUrl}>
                  <Icon className="material-symbols-outlined">
                    {urlCopied ? 'check' : 'content_copy'}
                  </Icon>
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {!isRegistered && (
            <>
              <Typography variant="h6" gutterBottom>
                Setup Your Last Will
              </Typography>
              <Typography mb={2} align="center">
                Select a repository and workflow to execute when you don&apos;t respond.
              </Typography>

              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Repository:
                </Typography>
                <Select
                  value={selectedRepo}
                  onChange={(e) => {
                    setSelectedRepo(e.target.value);
                    setWorkflows([]);
                    setSelectedWorkflow(null);
                    if (e.target.value) {
                      const [owner, name] = e.target.value.split('/');
                      fetchWorkflows(owner, name);
                    }
                  }}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select a repository
                  </MenuItem>
                  {repos.map((r) => (
                    <MenuItem key={`${r.owner}/${r.name}`} value={`${r.owner}/${r.name}`}>
                      {r.name} {r.private ? '(private)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Workflow:
                </Typography>
                <Select
                  value={selectedWorkflow ?? ''}
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
                      const [owner, name] = selectedRepo.split('/');
                      const workflow = workflows.find((w) => w.id === selectedWorkflow);
                      setPendingRegistration({
                        owner,
                        name,
                        workflowId: selectedWorkflow,
                        workflowName: workflow?.name || 'Unknown',
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
                      signedBy={auth.name || auth.login || 'User'}
                      repo={`${pendingRegistration.owner}/${pendingRegistration.name}`}
                      workflow={pendingRegistration.workflowName}
                      isLoading={saving}
                      onAgree={handleRegister}
                      onReset={() => {
                        setShowConsent(false);
                        setPendingRegistration(null);
                        setSelectedRepo('');
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
                checkFreqCode={checkFreq as 'day' | 'week' | 'month' | 'quarter' | 'year'}
                deadlineDays={deadlineDays}
                attemptsCount={attemptsCount}
                nextCheck={status?.nextCheck ? new Date(status.nextCheck) : new Date()}
                onUpdate={handleUpdateSettings}
              />

              <Channels
                telegramConnected={status.channels.telegram.connected}
                onConnectTelegram={handleConnectTelegram}
                onDisconnectTelegram={handleDisconnectTelegram}
              />
            </>
          )}

          <Button variant="text" onClick={handleLogout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Stack>
      </Container>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUnregister={handleUnregister}
        repo={status?.repo || null}
        workflow={status?.workflow || null}
      />
    </>
  );
}
