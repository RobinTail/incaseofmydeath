import { createServer } from "express-zod-api";
import { app } from "./app";
import { telegramChannel } from "./channels/telegram";
import { config } from "./config";
import { connection, Users } from "./db";
import { routing } from "./routing";

(async () => {
  const db = await connection;
  await Users.ensureIndexes();
  console.log(`Mongo ${db.version}`);
  const { data: appInfo } = await app.request("GET /app");
  console.log(appInfo);
  const botInfo = await telegramChannel.ready;
  console.log(botInfo);
  createServer(config, routing);
})();
