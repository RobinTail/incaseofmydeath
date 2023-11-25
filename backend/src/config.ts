import { createConfig } from "express-zod-api";
import fs from "fs";
import { createLogger, format, Logger, transports } from "winston";

export const frontendUrl = "https://www.incaseofmy.de/";
const sslDir = "/etc/letsencrypt/live/api.incaseofmy.de";

export const logger = createLogger({
  level: "debug",
  transports: new transports.Console({
    handleExceptions: true,
    format: format.simple(),
  }),
});

export const config = createConfig({
  server: {
    listen: process.env.PORT || 6060,
  },
  https: {
    options: {
      cert:
        process.env.ENV === "TEST"
          ? ""
          : fs.readFileSync(`${sslDir}/fullchain.pem`, "utf-8"),
      key:
        process.env.ENV === "TEST"
          ? ""
          : fs.readFileSync(`${sslDir}/privkey.pem`, "utf-8"),
    },
    listen: 443,
  },
  cors: true,
  logger,
});

declare module "express-zod-api" {
  interface LoggerOverrides extends Logger {}
  interface MockOverrides extends jest.Mock {}
}

export const github = {
  appId: 155154,
  clientId: "Iv1.a3d196a34df183d3",
  clientSecret:
    process.env.ENV == "TEST"
      ? ""
      : process.env.GITHUB_CLIENT_SECRET ||
        fs.readFileSync("client-secret.txt", "utf-8").trim(),
  privateKey:
    process.env.ENV == "TEST"
      ? "TEST"
      : process.env.GITHUB_PRIVATE_KEY ||
        fs.readFileSync("private-key.pem", "utf-8"),
};

export const mongo = {
  connectionString:
    process.env.ENV == "TEST"
      ? ""
      : process.env.MONGO_CONNECTION_STRING ||
        fs.readFileSync("db-secret.txt", "utf-8").trim(),
};

export const tgBot = {
  token:
    process.env.ENV == "TEST"
      ? ""
      : process.env.TELEGRAM_BOT_TOKEN ||
        fs.readFileSync("bot-token.txt", "utf8").trim(),
};
