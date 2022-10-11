import {Filters, Webpack, Finder} from "dium";

// finder extensions for development

const getWebpackRequire = (): Webpack.Require => {
    const chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk"));
    const chunk = window[chunkName];

    let webpackRequire: Webpack.Require;
    try {
        chunk.push([["__DIUM__"], {}, (require: Webpack.Require) => {
            webpackRequire = require;

            // prevent webpack from updating anything by throwing an error
            throw Error();
        }]);
    } catch {
        // eslint-disable no-empty
    }

    return webpackRequire;
};

/** The webpack require. */
const webpackRequire = getWebpackRequire();
export {webpackRequire as require};

const byExportsFilter = (exported: Webpack.Exports): Finder.Filter => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
};

const byModuleSourceFilter = (contents: string[]): Finder.Filter => {
    return (_, module) => {
        const source = sourceOf(module.id).toString();
        return contents.every((content) => source.includes(content));
    };
};

const applyFilters = (filters: Finder.Filter[]) => (module: Webpack.Module) => {
    const {exports} = module;
    return (
        filters.every((filter) => filter(exports, module, String(module.id)))
        || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module, String(module.id)))
    );
};

/** Returns all raw entires in the webpack cache. */
export const modules = (): Webpack.Module[] => Object.values(webpackRequire.c);

/** Returns all module source functions. */
export const sources = (): Webpack.ModuleFunction[] => Object.values(webpackRequire.m);

/** Returns the source function for a specific module.  */
export const sourceOf = (id: Webpack.Id | string): Webpack.ModuleFunction => webpackRequire.m[id] ?? null;

/** Finds a raw module using a set of filter functions. */
export const find = (...filters: Finder.Filter[]): Webpack.Module => modules().find(applyFilters(filters)) ?? null;

/** Finds a raw module using query options. */
export const query = (query: Filters.Query): Webpack.Module => find(Filters.query(query));

/**
 * Finds a raw module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: Webpack.Id | string): Webpack.Module => webpackRequire.c[id] ?? null;

/** Finds a module using its exports. */
export const byExports = (exported: Webpack.Exports): Webpack.Module => find(byExportsFilter(exported));

/** Finds a raw module using the name of its export.  */
export const byName = (name: string): Webpack.Module => find(Filters.byName(name));

/** Finds a raw module using property names of its export. */
export const byProps = (...props: string[]): Webpack.Module => find(Filters.byProps(...props));

/** Finds a raw module using prototype names of its export. */
export const byProtos = (...protos: string[]): Webpack.Module => find(Filters.byProtos(...protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: Filters.TypeOrPredicate<string>[]): Webpack.Module => find(Filters.bySource(...contents));

/** Finds a module using source code contents of its entire source code. */
export const byModuleSource = (...contents: string[]): Webpack.Module => find(byModuleSourceFilter(contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (...filters: Finder.Filter[]): Webpack.Module[] => modules().filter(applyFilters(filters)),

    /** Finds all modules using query options. */
    query: (query: Filters.Query): Webpack.Module[] => all.find(Filters.query(query)),

    /** Finds all modules using the exports. */
    byExports: (exported: Webpack.Exports): Webpack.Module[] => all.find(byExportsFilter(exported)),

    /** Finds all modules using the name of its export. */
    byName: (name: string): Webpack.Module[] => all.find(Filters.byName(name)),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]): Webpack.Module[] => all.find(Filters.byProps(...props)),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]): Webpack.Module[] => all.find(Filters.byProtos(...protos)),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: Filters.TypeOrPredicate<string>[]): Webpack.Module[] => all.find(Filters.bySource(...contents)),

    /** Finds all modules using source code contents of its entire source code. */
    byModuleSource: (...contents: string[]): Webpack.Module[] => all.find(byModuleSourceFilter(contents))
};

/** Returns module ids of all other modules imported in the module. */
export const resolveImportIds = (module: Webpack.Module): Webpack.Id[] => {
    // get module as source code
    const source = sourceOf(module.id).toString();

    // find require parameter name
    const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
    if (match) {
        // find require calls
        const requireName = match[1];
        const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\((\\d+)\\)`, "g")));
        return calls.map((call) => parseInt(call[1]));
    } else {
        return [];
    }
};

/** Returns all other raw modules imported in the module. */
export const resolveImports = (module: Webpack.Module): Webpack.Module[] => resolveImportIds(module).map((id) => byId(id));

/** Returns all raw style modules imported in the module. */
export const resolveStyles = (module: Webpack.Module): Webpack.Module[] => resolveImports(module).filter((imported) => (
    imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]: [string, string]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))
));

/** Returns the ids of all other modules importing the module. */
export const resolveUsersById = (id: Webpack.Id): Webpack.Module[] => all.find((_, user) => resolveImportIds(user).includes(id));

/** Returns all other raw modules importing the module. */
export const resolveUsers = (module: Webpack.Module): Webpack.Module[] => resolveUsersById(module.id);
