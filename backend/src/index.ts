import { createServer } from "express-zod-api";
import { app } from "./app.js";
import { logger, config } from "./config.js";
import { connection, Users } from "./db.js";
import { routing } from "./routing.js";

(async () => {
  const db = await connection;
  await Users.ensureIndexes();
  logger.info(`Mongo ${db.version}`);
  const { data: appInfo } = await app.request("GET /app");
  logger.info("GitHub Application", appInfo);
  await createServer(config, routing);
})();
