import globals from "globals";
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import prettierOverrides from "eslint-config-prettier";
import prettierRules from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import-x";

export default [
  { languageOptions: { globals: globals.browser } },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
];
