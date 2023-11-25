import { createServer } from "express-zod-api";
import { app } from "./app";
import { logger, config } from "./config";
import { connection, Users } from "./db";
import { routing } from "./routing";

(async () => {
  const db = await connection;
  await Users.ensureIndexes();
  logger.info(`Mongo ${db.version}`);
  const { data: appInfo } = await app.request("GET /app");
  logger.info("GitHub Application", appInfo);
  createServer({ ...config, logger }, routing);
})();
