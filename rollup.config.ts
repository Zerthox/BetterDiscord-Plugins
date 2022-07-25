import json from "@rollup/plugin-json";
import scss from "rollup-plugin-scss";
import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";
import type {RollupOptions} from "rollup";

const config: RollupOptions = {
    output: {
        format: "cjs",
        exports: "default",
        preferConst: true,
        freeze: false
    },
    plugins: [
        json({
            namedExports: true,
            preferConst: true
        }),
        scss({
            output: false
        }),
        typescript(),
        cleanup({
            comments: [/^\*[@#]__PURE__$/],
            maxEmptyLines: 0,
            extensions: ["js", "ts", "tsx"],
            sourcemap: false
        })
    ],
    treeshake: {
        preset: "smallest",
        annotations: true,
        moduleSideEffects: false,
        propertyReadSideEffects: false
    }
};

export default config;
