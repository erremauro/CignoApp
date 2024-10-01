const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['src/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Definisce i globali tipici dell'ambiente browser
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        module: 'readonly'
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  {
    files: ['src/js/**/*.js'],
    plugins: {
      prettier,
    },
    rules: {
      ...prettier.rules,
    },
  },
];
