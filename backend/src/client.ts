import { Client } from "express-zod-api";
import { routing } from "./routing";
import fs from "fs";

fs.writeFileSync(
  "../frontend/src/api-client.ts",
  new Client(routing).print(),
  "utf-8"
);
