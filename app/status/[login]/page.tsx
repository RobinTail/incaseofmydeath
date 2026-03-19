import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ login: string }>;
}

export default async function StatusPage({ params }: PageProps) {
  const { login } = await params;

  const user = await db.user.findFirst({
    where: {
      repoOwner: { equals: login, mode: "insensitive" },
      isPublic: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{user.repoOwner}&apos;s Status</h1>

      <div className={user.isAlive ? styles.alive : styles.dead}>
        <div className={styles.status}>{user.isAlive ? "ALIVE" : "DEAD"}</div>
        <p className={styles.lastConfirmed}>
          Last confirmed: {new Date(user.lastConfirmation).toLocaleString()}
        </p>
      </div>

      <p className={styles.note}>
        This status is public because the owner chose to share it.
      </p>

      <Link href="/" className={styles.link}>
        Create your own status page
      </Link>
    </div>
  );
}
