import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthAccessToken,
  getGitHubUser,
  findAppInstallation,
  getAppSlug,
} from "@/lib/github";
import { createUserToken } from "@/lib/auth";
import { getDefaultNextCheck } from "@/lib/utils";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const setupAction = searchParams.get("setup_action");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (setupAction === "install") {
    const response = NextResponse.redirect(`${frontendUrl}/api/auth/begin`);
    response.cookies.delete("oauth_state");
    return response;
  }

  const storedState = request.cookies.get("oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${frontendUrl}/?error=invalid_state`);
  }

  try {
    const accessToken = await getOAuthAccessToken(code);
    const githubUser = await getGitHubUser(accessToken);

    let user = await db.user.findUnique({
      where: { id: githubUser.id },
    });

    if (!user) {
      const installation = await findAppInstallation(accessToken);

      if (!installation) {
        const installUrl = `https://github.com/apps/${getAppSlug()}/installations/new`;
        return NextResponse.redirect(installUrl);
      }

      user = await db.user.create({
        data: {
          id: githubUser.id,
          installationId: installation.id,
          repoOwner: "",
          repoName: "",
          repoBranch: "main",
          workflowId: 0,
          isAlive: true,
          isPublic: false,
          isCountdown: false,
          checkFreq: "month",
          deadlineDays: 5,
          attemptsCount: 3,
          nextCheck: getDefaultNextCheck("month"),
          lastConfirmation: new Date(),
          telegramChatId: null,
        },
      });
    }

    const token = createUserToken(user.id);

    const response = NextResponse.redirect(`${frontendUrl}/personal`);
    response.cookies.delete("oauth_state");
    response.cookies.set("auth_token", token, {
      httpOnly: false, // @todo use a server component for reading this instead
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("OAuth finish error:", error);
    return NextResponse.redirect(`${frontendUrl}/?error=oauth_failed`);
  }
}
