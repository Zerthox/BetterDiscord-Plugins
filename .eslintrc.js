/** @type {import("eslint").Linter.Config} */
module.exports = {
    parser: "@typescript-eslint/parser",
    env: {
        browser: true,
        node: true
    },
    plugins: [
        "@typescript-eslint",
        "node",
        "import",
        "react",
        "react-hooks"
    ],
    settings: {
        react: {
            version: "17.0.2" // stable Discord
        }
    },
    parserOptions: {
        project: ["./tsconfig.json"]
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "google",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        indent: "off",
        semi: "off",
        quotes: "off",
        "comma-dangle": ["error", "never"],
        "quote-props": ["error", "as-needed"],
        "operator-linebreak": ["error", "before"],
        "no-multiple-empty-lines": ["error", {max: 1}],
        "spaced-comment": ["error", "always", {
            block: {
                balanced: true
            }
        }],
        "linebreak-style": "off",
        "max-len": "off",
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "react/display-name": "off",
        "new-cap": "off",
        "@typescript-eslint/indent": ["error", 4],
        "@typescript-eslint/semi": "error",
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/member-delimiter-style": ["error"],
        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_"
        }],
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/no-explicit-any": "off"
    }
};
