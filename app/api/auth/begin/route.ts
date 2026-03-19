import { NextResponse } from "next/server";
import { createOAuthState } from "@/lib/auth";

export async function GET() {
  const state = createOAuthState();

  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/api/auth/callback`)}&scope=repo&state=${state}`;

  const response = NextResponse.redirect(url);

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
