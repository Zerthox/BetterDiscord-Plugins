import { dirname } from "path";
import { fileURLToPath } from "url";

import { defineConfig, globalIgnores } from "eslint/config";
import { fixupPluginRules } from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            import: fixupPluginRules(_import),
            react,
            "react-hooks": fixupPluginRules(reactHooks),
        },
        settings: {
            react: {
                version: "19.0.0",
            },
        },
        rules: {
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "spaced-comment": [
                "error",
                "always",
                {
                    block: {
                        balanced: true,
                    },
                },
            ],
        },
        extends: compat.extends("eslint:recommended", "plugin:react/recommended"),
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        extends: compat.extends("plugin:@typescript-eslint/recommended"),
        languageOptions: {
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    globalIgnores(["**/node_modules/", "**/dist/"]),
]);
