import typescript from "@rollup/plugin-typescript";

export default {
    output: {
        dir: "dist",
        format: "cjs",
        exports: "default"
    },
    plugins: [
        typescript()
    ]
};
