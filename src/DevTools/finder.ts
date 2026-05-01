import { Filters, Webpack, Finder, Logger } from "dium";

// finder extensions for development

const getWebpackRequire = (): Webpack.Require => {
    const chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk")) as keyof Window;
    const chunk = window[chunkName];

    let webpackRequire = undefined as any as Webpack.Require;
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

const byExportsFilter = (exported: Webpack.Exports): Finder.ModuleFilter => {
    return (target) => target === exported;
};

const byModuleSourceFilter = (contents: string[]): Finder.ModuleFilter => {
    return (_, module) => {
        const factory = module?.id ? factoryOf(module.id) : undefined;
        const source = factory?.toString();
        return source ? contents.every((content) => source.includes(content)) : false;
    };
};

type Keys = boolean | string[];

const applyFilter =
    (filter: Finder.ModuleFilter, keys: Keys = ["default", "Z", "ZP"]) =>
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
    const cache: Record<Webpack.Id, Webpack.Module> = {};
    BdApi.Webpack.getModules(((_, module: Webpack.Module) => {
        cache[module.id] = module;
        return false;
    }) as Finder.ModuleFilter);
    return cache;
};

/** Returns all raw entires in the webpack cache. */
export const modules = (): Webpack.Module[] => Object.values(cache());

/** Returns all module source functions. */
export const sources = (): Webpack.ModuleFactory[] => Object.values(webpackRequire.m);

/** Returns the corresponding module id for a specific module's exports.  */
export const idOf = (exported: Webpack.Exports): Webpack.Id | undefined =>
    modules().find((module) => module.exports == exported)?.id;

/** Returns the factory function for a specific module.  */
export const factoryOf = (id: Webpack.Id): Webpack.ModuleFactory => webpackRequire.m[id];

/** Finds a raw module using a filter function. */
export const find = (filter: Finder.ModuleFilter, keys?: Keys): Webpack.Module | undefined =>
    modules().find(applyFilter(filter, keys));

/** Finds a raw module using query options. */
export const query = (query: Filters.Query, keys?: Keys): Webpack.Module | undefined =>
    find(Filters.query(query), keys);

/**
 * Finds a raw module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: Webpack.Id | string): Webpack.Module => cache()[id];

/** Finds a module using its exports. */
export const byExports = (exported: Webpack.Exports, keys?: Keys): Webpack.Module | undefined =>
    find(byExportsFilter(exported), keys);

/** Finds a raw module using the name of its export.  */
export const byName = (name: string, keys?: Keys): Webpack.Module | undefined => find(Filters.byName(name), keys);

/** Finds a raw module using property names of its export. */
export const byKeys = (props: string[], keys?: Keys): Webpack.Module | undefined =>
    find(Filters.byKeys(...props), keys);

/** Finds a raw module using prototype names of its export. */
export const byProtos = (protos: string[], keys?: Keys): Webpack.Module | undefined =>
    find(Filters.byProtos(...protos), keys);

/** Finds a module using source code contents of its export entries. */
export const bySource = (contents: Filters.TypeOrPredicate<string>[], keys?: Keys): Webpack.Module | undefined =>
    find(Filters.bySource(...contents), keys);

/** Finds a module using source code contents of its entire source code. */
export const byModuleSource = (contents: string[]): Webpack.Module | undefined => find(byModuleSourceFilter(contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a filter function. */
    find: (filter: Finder.ModuleFilter, keys?: Keys): Webpack.Module[] => modules().filter(applyFilter(filter, keys)),

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
    const factory = factoryOf(module.id);
    if (factory) {
        const source = factory.toString();
        // find require parameter name
        const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
        if (match) {
            // find require calls
            const requireName = match[1];
            const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\("?(\\d+)"?\\)`, "g")));
            return calls.map((call) => parseInt(call[1]));
        } else {
            Logger.error("Failed to find require in module factory");
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
    all.find((_, user) => (user ? resolveImportIds(user).includes(id) : false));

/** Returns all other raw modules importing the module. */
export const resolveUsers = (module: Webpack.Module): Webpack.Module[] => resolveUsersById(module.id);
