import {Filters, Require, Module, ModuleId, Exports, ModuleFunction, Query} from "discordium/api/finder";

// finder extensions for development

const getWebpackRequire = (): Require => {
    const moduleId = "discordium";

    // TODO: use chunk instead of bd's jsonp polyfill
    let webpackRequire: Require;
    global.webpackJsonp.push([[], {
        [moduleId]: (_module: Module, _exports: Exports, require: Require) => {
            webpackRequire = require;
        }
    }, [[moduleId]]]);

    // cleanup
    delete webpackRequire.m[moduleId];
    delete webpackRequire.c[moduleId];

    return webpackRequire;
};

/** The webpack require. */
const webpackRequire = getWebpackRequire();
export {webpackRequire as require};

type RawFilter = (exports: Exports, module: Module) => boolean;

const applyFilters = (filters: RawFilter[]) => (module: Module) => {
    const {exports} = module;
    return (
        filters.every((filter) => filter(exports, module))
        || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module))
    );
};

/** Returns all raw entires in the webpack cache. */
export const modules = (): Module[] => Object.values(webpackRequire.c);

/** Returns all module source functions. */
export const sources = (): ModuleFunction[] => Object.values(webpackRequire.m);

/** Returns the source function for a specific module.  */
export const sourceOf = (id: ModuleId | string): ModuleFunction => webpackRequire.m[id] ?? null;

/** Finds a raw module using a set of filter functions. */
export const find = (...filters: RawFilter[]): Module => modules().find(applyFilters(filters)) ?? null;

/** Finds a raw module using query options. */
export const query = (options: Query): Module => find(...Filters.generate(options));

/**
 * Finds a raw module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: ModuleId | string): Module => webpackRequire.c[id] ?? null;

/** Finds a module using its exports. */
export const byExports = (exported: Exports): Module => find(Filters.byExports(exported));

/** Finds a raw module using the name of its export.  */
export const byName = (name: string): Module => find(Filters.byName(name));

/** Finds a raw module using property names of its export. */
export const byProps = (...props: string[]): Module => find(Filters.byProps(props));

/** Finds a raw module using prototype names of its export. */
export const byProtos = (...protos: string[]): Module => find(Filters.byProtos(protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]): Module => find(Filters.bySource(contents));

/** Returns all module results. */
export const all = {
    /** Finds all raw modules using a set of filter functions. */
    find: (...filters: RawFilter[]): Module[] => modules().filter(applyFilters(filters)),

    /** Finds all raw modules using query options. */
    query: (options: Query): Module[] => all.find(...Filters.generate(options)),

    /** Finds all raw modules using the exports. */
    byExports: (exported: Exports): Module[] => all.find(Filters.byExports(exported)),

    /** Finds all raw modules using the name of its export. */
    byName: (name: string): Module[] => all.find(Filters.byName(name)),

    /** Finds all raw modules using property names of its export. */
    byProps: (...props: string[]): Module[] => all.find(Filters.byProps(props)),

    /** Finds all raw modules using prototype names of it export. */
    byProtos: (...protos: string[]): Module[] => all.find(Filters.byProtos(protos)),

    /** Finds all raw modules using source code contents of its export entries. */
    bySource: (...contents: string[]): Module[] => all.find(Filters.bySource(contents))
};

/** Returns module ids of all other modules imported in the module. */
export const resolveImportIds = (module: Module): ModuleId[] => {
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
export const resolveImports = (module: Module): Module[] => resolveImportIds(module).map((id) => byId(id));

/** Returns all raw style modules imported in the module. */
export const resolveStyles = (module: Module): Module[] => resolveImports(module).filter((imported) => (
    imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]: [string, string]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))
));

/** Returns the ids of all other modules importing the module. */
export const resolveUsersById = (id: ModuleId): Module[] => all.find((_, user) => resolveImportIds(user).includes(id));

/** Returns all other raw modules importing the module. */
export const resolveUsers = (module: Module): Module[] => resolveUsersById(module.id);
