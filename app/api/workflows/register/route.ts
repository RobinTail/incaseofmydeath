import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth';
import { getUserOctokit, getInstallationToken } from '@/lib/github';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getDefaultNextCheck } from '@/lib/utils';

const bodySchema = z.object({
  owner: z.string(),
  repo: z.string(),
  workflowId: z.number(),
  workflowName: z.string(),
  branch: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const decoded = verifyUserToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { owner, repo, workflowId, workflowName, branch = 'main' } = parsed.data;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const iToken = await getInstallationToken(user.installationId);
  const octokit = getUserOctokit(iToken);

  try {
    await octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}', {
      owner,
      repo,
      workflow_id: workflowId,
    });
  } catch {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  await db.user.update({
    where: { id: decoded.userId },
    data: {
      repoOwner: owner,
      repoName: repo,
      repoBranch: branch,
      workflowId,
      workflowName,
      nextCheck: getDefaultNextCheck(user.checkFreq),
      lastConfirmation: new Date(),
      isAlive: true,
      isCountdown: false,
    },
  });

  return NextResponse.json({ success: true });
}
