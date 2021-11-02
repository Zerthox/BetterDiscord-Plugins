import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import {RollupOptions} from "rollup";

export default {
    output: {
        format: "cjs",
        exports: "default",
        preferConst: true
    },
    plugins: [
        json({namedExports: false}),
        typescript()
    ]
} as RollupOptions;
