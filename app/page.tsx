"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

function ErrorBanner() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const errorMessage =
    errorParam === "invalid_state"
      ? "Invalid OAuth state. Please try again."
      : errorParam === "no_installation"
        ? "Please install the GitHub App first."
        : errorParam === "oauth_failed"
          ? "OAuth authentication failed. Please try again."
          : null;

  if (!errorMessage) return null;

  return <div className={styles.error}>{errorMessage}</div>;
}

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>In Case of My Death</h1>

        <p className={styles.description}>
          The Application fulfills your last will by executing a workflow from
          your private repository on GitHub in case of your death. Free from
          bias, blind to your secrets, cold-blooded as machine code.
        </p>

        <Suspense fallback={null}>
          <ErrorBanner />
        </Suspense>

        <div className={styles.card}>
          <h2>How it works</h2>
          <ol>
            <li>Create a workflow on GitHub for manual dispatch event</li>
            <li>
              Grant access to the Application (only workflow run permissions)
            </li>
            <li>Activate communication channels (e.g., Telegram bot)</li>
            <li>The App regularly communicates with you</li>
            <li>Confirm you are alive with a simple action</li>
            <li>
              If you don&apos;t respond in time... The App executes the workflow
            </li>
          </ol>
        </div>

        <div className={styles.card}>
          <h2>Safety concerns</h2>
          <p>
            The App does not read the contents of the repository and the
            workflow, but only initiates its launch in the specified case. You
            can use encrypted Action Secrets for sensitive information.
          </p>
        </div>

        <div className={styles.card}>
          <h2>Example workflow</h2>
          <pre className={styles.code}>{`name: Last will
on: workflow_dispatch
jobs:
  lastWill:
    runs-on: ubuntu-latest
    steps:
    - name: Send notification
      run: echo "Last will executed"`}</pre>
        </div>

        <a href="/api/auth/begin" className={styles.button}>
          Start with GitHub
        </a>
      </main>
    </div>
  );
}
