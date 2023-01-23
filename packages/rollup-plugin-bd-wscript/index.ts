import path from "path";
import {readFileSync} from "fs";
import type {Plugin} from "rollup";

const wscript = readFileSync(path.resolve(__dirname, "wscript.js"), "utf8").split("\n").filter((line) => line.trim().length > 0).join("\n");

/**
 * Rollup plugin for BetterDiscord WScript warning generation.
 */
export function bdWScript(): Plugin {
    return {
        name: "bd-meta",
        banner: `/*@cc_on @if (@_jscript)\n${wscript}\n@else @*/\n`,
        footer: "/*@end @*/"
    };
}

export default bdWScript;
