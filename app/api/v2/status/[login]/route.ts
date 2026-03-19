import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ login: string }> },
) {
  const { login } = await params;

  const user = await db.user.findFirst({
    where: {
      repoOwner: { equals: login, mode: "insensitive" },
      isPublic: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    login: user.repoOwner,
    avatarUrl: null,
    name: null,
    isAlive: user.isAlive,
    lastConfirmation: user.lastConfirmation,
  });
}
