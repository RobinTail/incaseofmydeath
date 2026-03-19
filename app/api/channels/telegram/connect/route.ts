import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";
import { verifyUserToken } from "@/lib/auth";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  code: z.string(),
  hash: z.string(),
  initData: z.record(z.string(), z.string()),
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const decoded = verifyUserToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { code, hash, initData } = parsed.data;

  const secretKey = createHash("sha256")
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest();

  const dataCheckString = Object.keys(initData)
    .sort()
    .map((key) => `${key}=${initData[key]}`)
    .join("\n");

  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (hash !== expectedHash) {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const telegramId = code || Object.values(initData)[0] || "";

  await db.user.update({
    where: { id: decoded.userId },
    data: { telegramChatId: telegramId },
  });

  return NextResponse.json({ success: true });
}
