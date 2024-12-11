import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Aggiungi la configurazione di Prettier per disabilitare le regole in conflitto
  {
    plugins: {
      prettier: prettier, // Aggiungi il plugin Prettier
    },
    rules: {
      "prettier/prettier": "error", // Segnala errori se il codice non è conforme alle regole di Prettier
    },
  },
];
