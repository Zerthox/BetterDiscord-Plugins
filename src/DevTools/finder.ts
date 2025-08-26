import { Filters, Webpack, Finder } from "dium";

// finder extensions for development

const getWebpackRequire = (): Webpack.Require => {
    const chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk"));
    const chunk = window[chunkName];

    let webpackRequire: Webpack.Require;
    try {
        chunk.push([
            [Symbol()],
            {},
            (require: Webpack.Require) => {
                webpackRequire = require;

                // prevent webpack from updating anything by throwing an error
                throw Error();
            },
        ]);
    } catch {
        // eslint-disable no-empty
    }

    return webpackRequire;
};

/** The webpack require. */
// FIXME: sentry overrides with own require, pushes existing but private cache
const webpackRequire = getWebpackRequire();
export { webpackRequire as require };

const byExportsFilter = (exported: Webpack.Exports): Finder.Filter => {
    return (target) => target === exported;
};

const byModuleSourceFilter = (contents: string[]): Finder.Filter => {
    return (_, module) => {
        const source = sourceOf(module.id);
        return source && contents.every((content) => source.toString().includes(content));
    };
};

type Keys = boolean | string[];

const applyFilter =
    (filter: Finder.Filter, keys: Keys = ["default", "Z", "ZP"]) =>
    (module: Webpack.Module) => {
        const { exports } = module;
        const check = typeof keys === "boolean" ? (keys ? Object.keys(exports ?? {}) : []) : keys;
        return (
            filter(exports, module, String(module.id))
            || (exports instanceof Object
                && check.some((key) => key in exports && filter(exports[key], module, String(module.id))))
        );
    };

/** Returns the raw webpack cache. */
export const cache = (): Record<Webpack.Id, Webpack.Module> => {
    // FIXME: artificially creating fake module cache via bdapi for now
    const cache = {};
    BdApi.Webpack.getModules((_, module) => {
        cache[module.id] = module;
        return false;
    });
    return cache;
};

/** Returns all raw entires in the webpack cache. */
export const modules = (): Webpack.Module[] => Object.values(cache());

/** Returns all module source functions. */
export const sources = (): Webpack.ModuleFactory[] => Object.values(webpackRequire.m);

/** Returns the corresponding module id for a specific module's exports.  */
export const idOf = (exported: Webpack.Exports): Webpack.Id =>
    modules().find((module) => module.exports == exported)?.id;

/** Returns the source function for a specific module.  */
export const sourceOf = (id: Webpack.Id): Webpack.ModuleFactory => webpackRequire.m[id] ?? null;

/** Finds a raw module using a filter function. */
export const find = (filter: Finder.Filter, keys?: Keys): Webpack.Module =>
    modules().find(applyFilter(filter, keys)) ?? null;

/** Finds a raw module using query options. */
export const query = (query: Filters.Query, keys?: Keys): Webpack.Module => find(Filters.query(query), keys);

/**
 * Finds a raw module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: Webpack.Id | string): Webpack.Module => cache()[id] ?? null;

/** Finds a module using its exports. */
export const byExports = (exported: Webpack.Exports, keys?: Keys): Webpack.Module =>
    find(byExportsFilter(exported), keys);

/** Finds a raw module using the name of its export.  */
export const byName = (name: string, keys?: Keys): Webpack.Module => find(Filters.byName(name), keys);

/** Finds a raw module using property names of its export. */
export const byKeys = (props: string[], keys?: Keys): Webpack.Module => find(Filters.byKeys(...props), keys);

/** Finds a raw module using prototype names of its export. */
export const byProtos = (protos: string[], keys?: Keys): Webpack.Module => find(Filters.byProtos(...protos), keys);

/** Finds a module using source code contents of its export entries. */
export const bySource = (contents: Filters.TypeOrPredicate<string>[], keys?: Keys): Webpack.Module =>
    find(Filters.bySource(...contents), keys);

/** Finds a module using source code contents of its entire source code. */
export const byModuleSource = (contents: string[]): Webpack.Module => find(byModuleSourceFilter(contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a filter function. */
    find: (filter: Finder.Filter, keys?: Keys): Webpack.Module[] => modules().filter(applyFilter(filter, keys)),

    /** Finds all modules using query options. */
    query: (query: Filters.Query, keys?: Keys): Webpack.Module[] => all.find(Filters.query(query), keys),

    /** Finds all modules using the exports. */
    byExports: (exported: Webpack.Exports, keys?: Keys): Webpack.Module[] => all.find(byExportsFilter(exported), keys),

    /** Finds all modules using the name of its export. */
    byName: (name: string, keys?: Keys): Webpack.Module[] => all.find(Filters.byName(name), keys),

    /** Finds all modules using property names of its export. */
    byKeys: (keys: string[], checkKeys?: Keys): Webpack.Module[] => all.find(Filters.byKeys(...keys), checkKeys),

    /** Finds all modules using prototype names of it export. */
    byProtos: (protos: string[], keys?: Keys): Webpack.Module[] => all.find(Filters.byProtos(...protos), keys),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (contents: Filters.TypeOrPredicate<string>[], keys?: Keys): Webpack.Module[] =>
        all.find(Filters.bySource(...contents), keys),

    /** Finds all modules using source code contents of its entire source code. */
    byModuleSource: (contents: string[]): Webpack.Module[] => all.find(byModuleSourceFilter(contents)),
};

/** Returns module ids of all other modules imported in the module. */
export const resolveImportIds = (module: Webpack.Module): Webpack.Id[] => {
    // get module as source code
    const factory = sourceOf(module.id);
    if (factory) {
        const source = factory.toString();
        // find require parameter name
        const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
        if (match) {
            // find require calls
            const requireName = match[1];
            const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\("?(\\d+)"?\\)`, "g")));
            return calls.map((call) => parseInt(call[1]));
        }
    }
    return [];
};

/** Returns all other raw modules imported in the module. */
export const resolveImports = (module: Webpack.Module): Webpack.Module[] =>
    resolveImportIds(module).map((id) => byId(id));

/** Returns all raw style modules imported in the module. */
export const resolveStyles = (module: Webpack.Module): Webpack.Module[] =>
    resolveImports(module).filter(
        (imported) =>
            imported instanceof Object
            && "exports" in imported
            && Object.values(imported.exports).every((value) => typeof value === "string")
            && Object.entries(imported.exports).find(([key, value]: [string, string]) =>
                new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`).test(value),
            ),
    );

/** Returns the ids of all other modules importing the module. */
export const resolveUsersById = (id: Webpack.Id): Webpack.Module[] =>
    all.find((_, user) => resolveImportIds(user).includes(id));

/** Returns all other raw modules importing the module. */
export const resolveUsers = (module: Webpack.Module): Webpack.Module[] => resolveUsersById(module.id);
