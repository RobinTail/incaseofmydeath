import { Integration } from "express-zod-api";
import { routing } from "./routing.js";
import fs from "node:fs/promises";

const client = new Integration({ routing });

client
  .printFormatted()
  .then((text) =>
    fs.writeFile("../frontend/src/generated/api-client.ts", text, "utf-8"),
  );
