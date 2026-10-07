const globals = require('globals')
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsParseIntent = require('@typescript-eslint/parser')
const reactHooksPlugin = require('eslint-plugin-react-hooks')

module.exports = [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParseIntent,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
         jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooksPlugin.configs['rules-latest'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]