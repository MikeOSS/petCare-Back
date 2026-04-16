import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig([
  globalIgnores(["node_modules/", "dist/", ".generated/", ".dagger/", "tests/"]),
  {
    ignores: ["node_modules/", "dist/", ".generated/", ".dagger/", "tests/"],
    files: ["src/**/*.ts", "core/**/*.ts"],
    plugins: { js, prettier, unicorn: eslintPluginUnicorn },
    extends: ["js/recommended"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  tseslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      ...prettierConfig.rules,
      "unicorn/no-null": "off",
      "unicorn/filename-case": ["error", { case: "camelCase" }],
      "unicorn/no-array-reverse": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-module": "off",
      "unicorn/catch-error-name": "off",
      "unicorn/switch-case-braches": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/numeric-separators-style": "off",
    },
  },
]);
