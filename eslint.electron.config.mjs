import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
  {
    files: ["electron/**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.electron,
      importPlugin.flatConfigs.typescript,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        MAIN_WINDOW_VITE_DEV_SERVER_URL: "readonly",
        MAIN_WINDOW_VITE_NAME: "readonly",
      },
    },
  },
]);
