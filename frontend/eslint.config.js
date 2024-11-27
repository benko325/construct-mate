import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tsParser from "@typescript-eslint/parser";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: globals.browser,
        },
    },

    pluginJs.configs.recommended,

    {
        plugins: { "@typescript-eslint": tseslint },
    },

    {
        settings: {
            react: {
                version: "detect",
            },
        },
        plugins: {
            react: pluginReact,
            "react-hooks": pluginReactHooks,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "react/prop-types": "off",
        },
    },

    pluginReact.configs.flat.recommended,
    eslintConfigPrettier
];