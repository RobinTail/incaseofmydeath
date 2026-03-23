import { NextResponse } from 'next/server';
import { createOAuthState } from '@/lib/auth';
import { getBaseUrl } from '@/lib/url';

export async function GET() {
  const state = createOAuthState();
  const baseUrl = getBaseUrl();

  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${baseUrl}/api/auth/callback`)}&scope=repo&state=${state}`;

  const response = NextResponse.redirect(url);

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
  });

  return response;
}
