import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
    output: {
        format: "cjs",
        exports: "default",
        preferConst: true
    } as const,
    plugins: [
        json({namedExports: false}),
        typescript()
    ]
};
