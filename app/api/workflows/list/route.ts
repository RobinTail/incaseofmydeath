import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { getUserOctokit, getInstallationToken } from '@/lib/github';

export async function GET(request: NextRequest) {
  const user = await getUserFromCookies(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const page = parseInt(searchParams.get('page') || '1');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 });
  }

  const iToken = await getInstallationToken(user.installationId);
  const octokit = getUserOctokit(iToken);

  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/workflows', {
      owner,
      repo,
      per_page: 5,
      page,
    });

    const workflows = data.workflows.map((w: { id: number; name: string }) => ({
      id: w.id,
      name: w.name,
    }));

    return NextResponse.json({
      workflows,
      page,
      hasMore: data.workflows.length === 5,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}
