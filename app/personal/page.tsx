"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"loading" | "unregistered" | "registered">(
    "loading",
  );

  const [repos, setRepos] = useState<Repo[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!cookieValue) {
      router.push("/");
      return;
    }

    setToken(cookieValue);
    fetchStatus(cookieValue);
  }, [router]);

  async function fetchStatus(t: string) {
    try {
      const res = await fetch("/api/registration/check", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatus(data);
      setStep(data.isRegistered ? "registered" : "unregistered");
      if (!data.isRegistered) {
        fetchRepos(t);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRepos(t: string) {
    const res = await fetch("/api/repos/list", {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setRepos(data.repos || []);
  }

  async function fetchWorkflows(t: string, owner: string, repo: string) {
    const res = await fetch(`/api/workflows/list?owner=${owner}&repo=${repo}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    const data = await res.json();
    setWorkflows(data.workflows || []);
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

  async function handleLogout() {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Personal Dashboard</h1>

      {status?.isAlive ? (
        <div style={{ color: "green", marginBottom: "1rem" }}>
          Status: Alive
        </div>
      ) : (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Status: Dead (workflow triggered)
        </div>
      )}

      {step === "unregistered" && (
        <div>
          <h2>Setup Your Last Will</h2>
          <p>
            Select a repository and workflow to execute when you don&apos;t
            respond.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <label>
              Repository:
              <select
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
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <option value="">Select a repository</option>
                {repos.map((r) => (
                  <option
                    key={`${r.owner}/${r.name}`}
                    value={`${r.owner}/${r.name}`}
                  >
                    {r.name} {r.private ? "(private)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>
              Workflow:
              <select
                value={selectedWorkflow || ""}
                onChange={(e) => setSelectedWorkflow(Number(e.target.value))}
                disabled={!selectedRepo}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <option value="">Select a workflow</option>
                {workflows.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={handleRegister}
            disabled={!selectedRepo || !selectedWorkflow || saving}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#24292e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? "Registering..." : "Register Workflow"}
          </button>
        </div>
      )}

      {step === "registered" && status && (
        <div>
          <div className="card">
            <h3>Registered Workflow</h3>
            <p>
              <strong>Repository:</strong> {status.repo?.owner}/
              {status.repo?.name}
            </p>
            <p>
              <strong>Check Frequency:</strong> {status.checkFreq}
            </p>
            <p>
              <strong>Deadline:</strong> {status.deadlineDays} days
            </p>
            <p>
              <strong>Attempts:</strong> {status.attemptsCount}
            </p>
            <p>
              <strong>Next Check:</strong>{" "}
              {new Date(status.nextCheck).toLocaleDateString()}
            </p>
          </div>

          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Telegram Channel</h3>
            {status.channels.telegram.connected ? (
              <>
                <p style={{ color: "green" }}>Connected</p>
                <button
                  onClick={handleDisconnectTelegram}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <p style={{ color: "#666" }}>Not connected</p>
                <a
                  href="https://t.me/YourBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#0088cc",
                    color: "white",
                    borderRadius: "4px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Connect Telegram
                </a>
              </>
            )}
          </div>

          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>Public Status</h3>
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                checked={status.isPublic}
                onChange={handleTogglePublic}
                disabled={saving}
              />
              Make my status public
            </label>
            {status.isPublic && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                View at: <code>/status/{status.repo?.owner}</code>
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            color: "#666",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <style jsx>{`
        .card {
          padding: 1.5rem;
          background: #f5f5f5;
          border-radius: 12px;
        }
        @media (prefers-color-scheme: dark) {
          .card {
            background: #2a2a2a;
            color: #e0e0e0;
          }
        }
      `}</style>
    </div>
  );
}
