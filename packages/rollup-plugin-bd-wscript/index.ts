import path from "path";
import { readFileSync } from "fs";
import type { Plugin } from "rollup";

const wscript = readFileSync(path.join(__dirname, "wscript.js"), "utf8")
    .split("\n")
    .filter((line) => {
        const trim = line.trim();
        return trim.length > 0 && !trim.startsWith("//") && !trim.startsWith("/*");
    })
    .join("\n");

/**
 * Rollup plugin for BetterDiscord WScript warning generation.
 */
export function bdWScript(): Plugin {
    return {
        name: "bd-meta",
        banner: `/*@cc_on @if (@_jscript)\n${wscript}\n@else @*/\n`,
        footer: "/*@end @*/",
    };
}

export default bdWScript;
