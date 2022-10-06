import * as Filters from "./filters";
import {Filter, Query} from "./filters";

export interface QueryWithResolve extends Query {
    resolve?: boolean;
}

const resolveExport = (
    target: any,
    filter?: (target: any) => boolean
) => {
    if (target && typeof filter === "function") {
        return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
    }
    return target;
};

/** Finds a module using a set of filter functions. */
export const find = (filter: Filter, resolve = true): any => BdApi.Webpack.getModule(filter, {defaultExport: resolve});

/** Finds a module using query options. */
export const query = (options: QueryWithResolve): any => find(Filters.query(options), options.resolve);

/** Finds a module using the name of its export.  */
export const byName = (name: string, resolve = true): any => find(Filters.byName(name), resolve);

/** Finds a module using the name of any value within its export. */
export const byAnyName = (name: string, resolve = true): any => resolveExport(find(Filters.byAny(Filters.byName(name))), resolve ? Filters.byName(name) : null);

/** Finds a module using property names of its export. */
export const byProps = (...props: string[]): any => find(Filters.byProps(...props));

/** Finds a module using prototype names of its export. */
export const byProtos = (...protos: string[]): any => find(Filters.byProtos(...protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]): any => find(Filters.bySource(...contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (filter: Filter, resolve = true): any[] => BdApi.Webpack.getModule(filter, {first: false, defaultExport: resolve}) ?? [],

    /** Finds all modules using query options. */
    query: (options: QueryWithResolve): any[] => all.find(Filters.query(options), options.resolve),

    /** Finds all modules using the name of its export. */
    byName: (name: string, resolve = true): any[] => all.find(Filters.byName(name), resolve),

    /** Finds all modules using the name of any value within its export. */
    byAnyName: (name: string, resolve = true): any[] => all.find(Filters.byAny(Filters.byName(name))).map((entry) => resolveExport(entry, resolve ? Filters.byName(name) : null)),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]): any[] => all.find(Filters.byProps(...props)),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]): any[] => all.find(Filters.byProtos(...protos)),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: string[]): any[] => all.find(Filters.bySource(...contents))
};
