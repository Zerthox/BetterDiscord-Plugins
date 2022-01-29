import * as filters from "./filters";
import * as raw from "./raw";
import {Exports, Filter, FilterOptions} from "./raw";

export * as raw from "./raw";
export * as filters from "./filters";
export {Module, Exports, Require, Filter} from "./raw";

export interface Query extends FilterOptions {
    export?: string;
}

/** Returns a list of exports for all modules. */
export const getAll = () => raw.getAll().map((entry) => raw.resolveExports(entry));

/** Finds a module using a set of filter functions. */
export const find = (...filters: Filter[]) => raw.resolveExports(raw.find(...filters));

/** Finds a module using query options. */
export const query = (options: Query) => raw.resolveExports(raw.query(options), {export: options.export});

/**
 * Finds a module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: number | string) => raw.resolveExports(raw.byId(id));

/** Finds a module using its exports. */
export const byExports = (exported: Exports) => raw.resolveExports(raw.byExports(exported));

/** Finds a module using the name of its export.  */
export const byName = (name: string) => raw.resolveExports(raw.byName(name), {name});

/** Finds a module using property names of its export.  */
export const byProps = (...props: string[]) => raw.resolveExports(raw.byProps(...props), {filter: filters.byProps(props)});

/** Finds a module using prototype names of its export. */
export const byProtos = (...protos: string[]) => raw.resolveExports(raw.byProtos(...protos), {filter: filters.byProtos(protos)});

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]) => raw.resolveExports(raw.bySource(...contents), {filter: filters.bySource(contents)});

/** Returns module ids of all other modules imported in the module. */
export const resolveImportIds = (exported: Exports) => raw.resolveImportIds(raw.byExports(exported));

/** Returns exports of all other modules imported in the module. */
export const resolveImports = (exported: Exports) => raw.resolveImports(raw.byExports(exported)).map((entry) => raw.resolveExports(entry));

/** Returns all style modules imported in the module. */
export const resolveStyles = (exported: Exports) => raw.resolveStyles(raw.byExports(exported)).map((entry) => raw.resolveExports(entry));

/** Returns all other modules importing the module. */
export const resolveUsers = (exported: Exports) => raw.resolveUsers(raw.byExports(exported)).map((entry) => raw.resolveExports(entry));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (...filters: Filter[]) => raw.all.find(...filters).map((entry) => raw.resolveExports(entry)),

    /** Finds all modules using query options. */
    query: (options: Query) => raw.all.query(options).map((entry) => raw.resolveExports(entry, {export: options.export})),

    /** Finds all modules using the exports. */
    byExports: (exported: Exports) => raw.all.byExports(exported).map((entry) => raw.resolveExports(entry)),

    /** Finds all modules using the name of its export. */
    byName: (name: string) => raw.all.byName(name).map((entry) => raw.resolveExports(entry, {name})),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]) => raw.all.byProps(...props).map((entry) => raw.resolveExports(entry, {filter: filters.byProps(props)})),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]) => raw.all.byProtos(...protos).map((entry) => raw.resolveExports(entry, {filter: filters.byProtos(protos)})),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: string[]) => raw.all.bySource(...contents).map((entry) => raw.resolveExports(entry, {filter: filters.bySource(contents)}))
};
