import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkFreqToDays } from "@/lib/utils";
import { msInDay } from "@/lib/utils";

const debounceMap = new Map<string, number>();
const DEBOUNCE_SECONDS = 60;

function debounceCheck(key: string): boolean {
  const now = Date.now();
  const lastCall = debounceMap.get(key);
  if (lastCall && now - lastCall < DEBOUNCE_SECONDS * 1000) {
    return false;
  }
  debounceMap.set(key, now);
  return true;
}

export async function POST(request: NextRequest) {
  const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
  if (secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = await request.json();

  if (!debounceCheck("telegram")) {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  const chatId = message?.chat?.id;
  const text = message?.text;
  const userId = message?.from?.id;

  if (!chatId) {
    return NextResponse.json({ ok: true });
  }

  const frontendUrl = process.env.FRONTEND_URL || "https://incaseofmy.de";

  if (text === "/start" || text === "/help") {
    await sendMessage(
      chatId,
      `Please go to the [application website](${frontendUrl}) for registration and setup`,
      "MarkdownV2",
    );
    await markUserAlive(chatId);
    return NextResponse.json({ ok: true });
  }

  if (userId) {
    await markUserAlive(chatId);
  }

  return NextResponse.json({ ok: true });
}

async function markUserAlive(chatId: number | string) {
  const user = await db.user.findUnique({
    where: { telegramChatId: String(chatId) },
  });

  if (!user) {
    return;
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isAlive: true,
      isCountdown: false,
      lastConfirmation: new Date(),
      nextCheck: new Date(
        Date.now() + checkFreqToDays(user.checkFreq) * msInDay,
      ),
    },
  });
}

async function sendMessage(
  chatId: number | string,
  text: string,
  parseMode?: "MarkdownV2" | "HTML" | "Markdown",
) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    },
  );
}
