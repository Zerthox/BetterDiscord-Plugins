import json from "@rollup/plugin-json";
import scss from "rollup-plugin-scss";
import typescript from "@rollup/plugin-typescript";
import tsTransformPure from "./ts-transform-pure";
import cleanup from "rollup-plugin-cleanup";
import {RollupOptions} from "rollup";

export default {
    output: {
        format: "cjs",
        exports: "default",
        preferConst: true
    },
    plugins: [
        json({
            namedExports: true,
            preferConst: true
        }),
        scss({
            output: false
        }),
        typescript({
            transformers: {
                before: [tsTransformPure]
            }
        }),
        cleanup({
            comments: [/^\*[@#]__PURE__$/],
            maxEmptyLines: 0,
            extensions: ["js", "ts", "tsx"]
        })
    ],
    treeshake: "smallest"
} as RollupOptions;
