import { createHash, createHmac } from "crypto";

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode?: "MarkdownV2" | "HTML",
) {
  const response = await fetch(
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
  return response.json();
}

export function validateTelegramHash(
  botToken: string,
  dataCheckString: string,
  hash: string,
): boolean {
  const secretKey = createHash("sha256").update(botToken).digest();

  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hash === expectedHash;
}

export function buildTelegramDataCheckString(initData: Record<string, string>) {
  const pairs: string[] = [];
  Object.keys(initData)
    .sort()
    .forEach((key) => {
      pairs.push(`${key}=${initData[key]}`);
    });
  return pairs.join("\n");
}
