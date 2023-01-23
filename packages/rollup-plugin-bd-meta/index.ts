import path from "path";
import type {Plugin} from "rollup";
import {resolvePkg, readMetaFromPkg, writeMeta, Meta} from "bd-meta";

export interface Options {
    meta?: Partial<Meta>;
}

/**
 * Rollup plugin for BetterDiscord plugin meta generation.
 */
export function bdMeta(options: Options = {}): Plugin {
    const pkgFiles: Record<string, string> = {};

    return {
        name: "bd-meta",
        async buildStart({input}) {
            const inputFiles = Array.isArray(input) ? input : Object.values(input);
            for (const input of inputFiles) {
                const pkg = await resolvePkg(path.dirname(input));
                pkgFiles[input] = pkg;
                this.addWatchFile(pkg);
            }
        },
        async watchChange(id, {event}) {
            for (const input of Object.keys(pkgFiles)) {
                if (pkgFiles[input] == id) {
                    if (event === "delete") {
                        const pkg = await resolvePkg(path.dirname(input));
                        pkgFiles[input] = pkg;
                        this.addWatchFile(pkg);
                    }
                    break;
                }
            }
        },
        renderChunk: {
            order: "post",
            async handler(code, chunk) {
                if (chunk.isEntry) {
                    const pkg = pkgFiles[chunk.facadeModuleId];
                    return {
                        code: writeMeta({
                            ...pkg ? await readMetaFromPkg(pkg) : {},
                            ...options.meta
                        }) + code,
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
