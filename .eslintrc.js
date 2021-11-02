module.exports = {
    parser: "@typescript-eslint/parser",
    env: {
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
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "google"
    ],
    rules: {
        indent: ["error", 4],
        quotes: ["error", "double"],
        "comma-dangle": ["error", "never"],
        "quote-props": ["error", "as-needed"],
        "operator-linebreak": ["error", "before"],
        "linebreak-style": "off",
        "max-len": "off",
        "no-undef": "off",
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-empty-function": "off"
    }
};
