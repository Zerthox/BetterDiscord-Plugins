import path from "path";
import { promises as fs } from "fs";
import camelCase from "lodash.camelcase";
import upperFirst from "lodash.upperfirst";
import type { PackageJson } from "type-fest";
import type { Meta } from "betterdiscord";

export type { Meta } from "betterdiscord";

export interface PackageWithMeta extends PackageJson.PackageJsonStandard {
    meta?: Partial<Meta>;
}

export async function resolvePkg(dir: string): Promise<string> {
    let current = path.resolve(dir);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const file = path.join(dir, "package.json");
            if (await fs.stat(file)) {
                return file;
            }
        } catch {
            const parent = path.dirname(current);
            if (parent != current) {
                current = parent;
            } else {
                break;
            }
        }
    }
    return undefined;
}

export interface Options {
    authorGithub?: boolean;
}

export async function readMetaFromPkg(file: string, { authorGithub = false }: Options = {}): Promise<Meta> {
    const pkg = JSON.parse(await fs.readFile(file, "utf8")) as PackageWithMeta;
    return {
        name: upperFirst(camelCase(pkg.name)),
        version: pkg.version,
        author: typeof pkg.author === "string" ? pkg.author : pkg.author.name,
        authorLink:
            typeof pkg.author === "object"
                ? pkg.author.url
                : authorGithub
                  ? `https://github.com/${pkg.author}`
                  : undefined,
        description: pkg.description,
        website: pkg.homepage,
        ...pkg.meta,
    };
}

export function writeMeta(meta: Partial<Meta>): string {
    let result = "/**";
    for (const [key, value] of Object.entries(meta)) {
        if (typeof value === "string") {
            result += `\n * @${key} ${value.replace(/\n/g, "\\n")}`;
        }
    }
    return result + "\n**/\n";
}
