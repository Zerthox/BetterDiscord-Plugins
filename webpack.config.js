/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "lib"),
    output: {
        filename: "discordium.js",
        path: path.resolve(__dirname, "dist"),
        library: {
            type: "commonjs"
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};
