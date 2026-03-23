import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromCookies(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isRegistered = !!user.repoOwner && !!user.repoName && !!user.workflowId;

  return NextResponse.json({
    isRegistered,
    isAlive: user.isAlive,
    isPublic: user.isPublic,
    checkFreq: user.checkFreq,
    deadlineDays: user.deadlineDays,
    attemptsCount: user.attemptsCount,
    nextCheck: user.nextCheck,
    repo: isRegistered ? { owner: user.repoOwner, name: user.repoName } : null,
    workflow: isRegistered ? { id: user.workflowId, name: user.workflowName } : null,
    channels: {
      telegram: { connected: !!user.telegramChatId },
    },
  });
}
