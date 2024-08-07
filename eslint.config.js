import globals from "globals";
import jsPlugin from "@eslint/js";
import { readFileSync } from "node:fs";
import tsPlugin from "typescript-eslint";
import prettierOverrides from "eslint-config-prettier";
import prettierRules from "eslint-plugin-prettier/recommended";
import unicornPlugin from "eslint-plugin-unicorn";
import hooksPlugin from "eslint-plugin-react-hooks";
import allowedDepsPlugin from "eslint-plugin-allowed-dependencies";
import backendJson from "./backend/package.json" assert { type: "json" };
import frontendJson from "./frontend/package.json" assert { type: "json" };

export default [
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    plugins: {
      unicorn: unicornPlugin,
      allowed: allowedDepsPlugin,
      "react-hooks": hooksPlugin,
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
    },
  },
  // For the sources
  {
    files: ["backend/src/*.ts"],
    rules: {
      "allowed/dependencies": ["error", { manifest: backendJson }],
    },
  },
  {
    files: ["frontend/src/*.+(ts|tsx)"],
    rules: {
      "allowed/dependencies": ["error", { manifest: frontendJson }],
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
