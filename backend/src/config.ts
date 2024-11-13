import { createConfig, BuiltinLogger } from "express-zod-api";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

export const frontendUrl = "https://www.incaseofmy.de/";
const sslDir = "/etc/letsencrypt/live/api.incaseofmy.de";

export const logger = new BuiltinLogger({
  level: "debug",
  color: true,
});

declare module "express-zod-api" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmentation
  interface LoggerOverrides extends BuiltinLogger {}
}

export const config = createConfig({
  https: {
    listen: 443,
    options: {
      cert:
        process.env.NODE_ENV === "test"
          ? ""
          : fs.readFileSync(`${sslDir}/fullchain.pem`, "utf-8"),
      key:
        process.env.NODE_ENV === "test"
          ? ""
          : fs.readFileSync(`${sslDir}/privkey.pem`, "utf-8"),
    },
  },
  compression: true,
  cors: true,
  logger,
  gracefulShutdown: true,
  childLoggerProvider: ({ parent }) =>
    parent.child({ requestId: randomUUID() }),
});

export const github = {
  appId: 155154,
  clientId: "Iv1.a3d196a34df183d3",
  clientSecret:
    process.env.NODE_ENV == "test"
      ? ""
      : process.env.GITHUB_CLIENT_SECRET ||
        fs.readFileSync("client-secret.txt", "utf-8").trim(),
  privateKey:
    process.env.NODE_ENV == "test"
      ? "TEST"
      : process.env.GITHUB_PRIVATE_KEY ||
        fs.readFileSync("private-key.pem", "utf-8"),
};

export const mongo = {
  connectionString:
    process.env.NODE_ENV == "test"
      ? ""
      : process.env.MONGO_CONNECTION_STRING ||
        fs.readFileSync("db-secret.txt", "utf-8").trim(),
};

export const tgBot = {
  token:
    process.env.NODE_ENV == "test"
      ? ""
      : process.env.TELEGRAM_BOT_TOKEN ||
        fs.readFileSync("bot-token.txt", "utf8").trim(),
};
