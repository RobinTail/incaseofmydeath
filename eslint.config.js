import globals from "globals";
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import prettierOverrides from "eslint-config-prettier";
import prettierRules from "eslint-plugin-prettier/recommended";
import unicornPlugin from "eslint-plugin-unicorn";
import hooksPlugin from "eslint-plugin-react-hooks";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import migration from "express-zod-api/migration";

const dirName = dirname(fileURLToPath(import.meta.url));

export default [
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    plugins: {
      unicorn: unicornPlugin,
      allowed: allowedDepsPlugin,
      "react-hooks": hooksPlugin,
      migration,
    },
  },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettierOverrides,
  prettierRules,
  // Things to turn off globally
  { ignores: ["*/dist/"] },
  // Things to turn on globally
  {
    rules: {
      "unicorn/prefer-node-protocol": "error",
      "migration/v21": "error",
    },
  },
  // For the sources
  {
    files: ["backend/src/*.ts"],
    rules: {
      "allowed/dependencies": [
        "error",
        { packageDir: join(dirName, "backend") },
      ],
    },
  },
  {
    files: ["frontend/src/*.+(ts|tsx)"],
    rules: {
      "allowed/dependencies": [
        "error",
        { packageDir: join(dirName, "frontend") },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // For tests
  {
    files: ["backend/src/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "allowed/dependencies": "off",
    },
  },
  // Special needs of the generated code
  {
    files: ["frontend/src/generated/*.+(ts|tsx)"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowObjectTypes: "always" },
      ],
    },
  },
];
