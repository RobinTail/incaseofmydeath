import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/auth";
import { getUserOctokit } from "@/lib/github";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const decoded = verifyUserToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const iToken = await getInstallationTokenForUser(user.installationId);
  const octokit = getUserOctokit(iToken);

  try {
    const { data } = await octokit.request("GET /user/repos", {
      per_page: 5,
      page,
      sort: "updated",
    });

    const repos = data.map(
      (repo: { owner: { login: string }; name: string; private: boolean }) => ({
        owner: repo.owner.login,
        name: repo.name,
        private: repo.private,
      }),
    );

    return NextResponse.json({
      repos,
      page,
      hasMore: data.length === 5,
    });
  } catch (error) {
    console.error("Error fetching repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 },
    );
  }
}

async function getInstallationTokenForUser(installationId: number) {
  const { getInstallationToken } = await import("@/lib/github");
  return getInstallationToken(installationId);
}
