import postcss from "postcss";
import postcssModules from "postcss-modules";
import camelCase from "lodash.camelcase";
import type {Plugin} from "rollup";

export type PostCSSModulesOptions = Parameters<typeof postcssModules>[0];

export interface Options {
    modules?: Omit<PostCSSModulesOptions, "getJSON">;
    cleanup?: boolean;
}

/**
 * Rollup plugin for custom style handling.
 *
 * Transforms CSS modules and removes empty rules.
 * Exports styles as string as named `css` export and mapped classNames as `default` export.
 */
export function styleModules({modules, cleanup = true}: Options = {}): Plugin {
    const filter = (id: string) => /\.module\.(css|scss|sass)$/.test(id);

    return {
        name: "styleModules",
        async transform(code, id) {
            if (filter(id)) {
                // we expect stringified css string to be the default export
                const [, cssString] = /\s*export\s+default\s+(.+)$/.exec(code) ?? [];
                if (cssString) {
                    const css = JSON.parse(cssString);

                    let mapping: Record<string, string>;
                    const result = await postcss()
                        .use(postcssModules({
                            ...modules,
                            getJSON: (_file, json) => mapping = json
                        }))
                        .use(cleanup ? {
                            postcssPlugin: "cleanup",
                            OnceExit(root) {
                                for (const child of root.nodes) {
                                    if (child.type === "rule") {
                                        const contents = child.nodes.filter((node) => node.type !== "comment");
                                        if (contents.length === 0) {
                                            child.remove();
                                        }
                                    }
                                }
                            }
                        } : null)
                        .process(css, {from: id});

                    const named = Object.entries(mapping).map(([key, value]) => `    ${camelCase(key)}: ${JSON.stringify(value)}`).join(",\n");
                    return {
                        code: `export const css = ${JSON.stringify(result.css)};\nexport default {\n${named}\n}`,
                        map: {
                            mappings: ""
                        }
                    };
                }
            }
        }
    };
}

export default styleModules;
