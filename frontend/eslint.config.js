import js from '@eslint/js'
import globals from 'globals'
import reactHooks from '@eslint-plugin-react-hooks'
import reactRefresh from '@eslint-plugin-react-refresh'
import tailwindcss from "@eslint-plugin-tailwindcss"
import tseslint from 'typescript-eslint'
import { eslint } from "@eslint/js"
import react from "eslint-plugin-react"
import importPlugin from "@eslint-plugin-import"
import typescriptPlugin from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: typescriptParser, // Optional if using TypeScript
    },
    plugins: {
      react,
      tailwindcss,
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...tailwindcss.configs.recommended.rules,
      ...eslint.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external", "internal"]],
          "newlines-between": "always",
        },
      ],
      "no-console": "warn", // Warns on console logs
      "no-unused-vars": "warn", // Warns on unused variables
      "@typescript-eslint/no-unused-vars": "warn", // Only for TypeScript
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
)
