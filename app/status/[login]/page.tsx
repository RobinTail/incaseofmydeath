import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { StatusContent } from './StatusContent';

interface PageProps {
  params: Promise<{ login: string }>;
}

export default async function StatusPage({ params }: PageProps) {
  const { login } = await params;

  const user = await db.user.findFirst({
    where: {
      repoOwner: { equals: login, mode: 'insensitive' },
      isPublic: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <StatusContent
      login={user.repoOwner}
      isAlive={user.isAlive}
      lastConfirmation={user.lastConfirmation}
    />
  );
}
