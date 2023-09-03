import { Integration } from "express-zod-api";
import { routing } from "./routing";
import fs from "fs";

fs.writeFileSync(
  "../frontend/src/generated/api-client.ts",
  new Integration({ routing }).print(),
  "utf-8",
);
