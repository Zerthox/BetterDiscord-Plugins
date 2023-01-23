import type {Plugin} from "rollup";
import type {Meta} from "betterdiscord";

export type {Meta} from "betterdiscord";

export interface Options {
    meta: Meta;
}

function buildMeta(meta: Meta): string {
    let result = "/**";
    for (const [key, value] of Object.entries(meta)) {
        result += `\n * @${key} ${value.replace(/\n/g, "\\n")}`;
    }
    return result + "\n**/\n";
}

/**
 * Rollup plugin for BetterDiscord plugin meta generation.
 */
export function bdMeta({meta}: Options): Plugin {
    const banner = buildMeta(meta);

    return {
        name: "bd-meta",
        renderChunk: {
            order: "post",
            handler(code, chunk) {
                if (chunk.isEntry) {
                    return {
                        code: banner + code,
                        map: {
                            mappings: ""
                        }
                    };
                }
            }
        }
    };
}

export default bdMeta;
