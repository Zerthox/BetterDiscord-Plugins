import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import sass from "rollup-plugin-sass";
import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

export default defineConfig({
    output: {
        format: "cjs",
        exports: "default",
        generatedCode: {
            constBindings: true,
            objectShorthand: true,
        },
        freeze: false,
    },
    plugins: [
        json({
            namedExports: true,
            preferConst: true,
        }),
        sass({
            api: "modern",
            output: false,
            options: {
                style: "compressed",
            },
        }),
        typescript(),
        cleanup({
            comments: [/[@#]__PURE__/],
            maxEmptyLines: 0,
            extensions: ["js", "ts", "tsx"],
            sourcemap: false,
        }),
    ],
    treeshake: {
        preset: "smallest",
        annotations: true,
        moduleSideEffects: false,
        propertyReadSideEffects: false,
    },
});
