import globals from "globals";
import jsPlugin from "@eslint/js";
import tsPlugin from "typescript-eslint";
import prettierOverrides from "eslint-config-prettier";
import prettierRules from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  {
    languageOptions: { globals: globals.browser },
    plugins: {
      import: importPlugin,
      "react-hooks": hooksPlugin,
    },
    settings: {
      // "import-x" plugin installed as "import", in order to suppress the warning from the typescript resolver
      // @link https://github.com/import-js/eslint-import-resolver-typescript/issues/293
      "import-x/resolver": { typescript: true, node: true },
    },
  },
  jsPlugin.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettierOverrides,
  prettierRules,
  // Things to turn off globally
  { ignores: ["dist/"] },
  // Things to turn on globally
  {
    rules: {
      "import/named": "error",
      "import/export": "error",
      "import/no-duplicates": "warn",
    },
  },
  // For the sources
  {
    files: ["src/*.+(ts|tsx)"],
    rules: {
      "import/no-extraneous-dependencies": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  // Special needs of the generated code
  {
    files: ["src/generated/*.+(ts|tsx)"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowObjectTypes: "always" },
      ],
    },
  },
];
