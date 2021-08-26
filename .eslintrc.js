module.exports = {
    parser: "@babel/eslint-parser",
    env: {
        node: true
    },
    plugins: [
        "node",
        "react"
    ],
    settings: {
        react: {
            version: "17.0.2" // stable Discord
        }
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "google"
    ],
    rules: {
        indent: ["error", 4],
        quotes: ["error", "double"],
        "comma-dangle": ["error", "never"],
        "quote-props": ["error", "as-needed"],
        "max-len": "off",
        "no-undef": "off",
        "require-jsdoc": "off",
        "valid-jsdoc": "off",
        "react/prop-types": "off",
        "react/react-in-jsx-scope": "off",
        "react/display-name": "off"
    }
};
