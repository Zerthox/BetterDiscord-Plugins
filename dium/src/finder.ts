import * as Filters from "./filters";
import {Filter, Query, TypeOrPredicate} from "./filters";

export interface QueryWithResolve extends Query {
    resolve?: boolean;
}

/** Finds a module using a set of filter functions. */
export const find = (filter: Filter, resolve = true): any => BdApi.Webpack.getModule(filter, {defaultExport: resolve});

/** Finds a module using query options. */
export const query = (options: QueryWithResolve): any => find(Filters.query(options), options.resolve);

/** Finds a module using the name of its export.  */
export const byName = (name: string, resolve?: boolean): any => find(Filters.byName(name), resolve);

/** Finds a module using property names of its export. */
export const byProps = (props: string[], resolve?: boolean): any => find(Filters.byProps(...props), resolve);

/** Finds a module using prototype names of its export. */
export const byProtos = (protos: string[], resolve?: boolean): any => find(Filters.byProtos(...protos), resolve);

/** Finds a module using source code contents of its export entries. */
export const bySource = (contents: TypeOrPredicate<string>[], resolve?: boolean): any => find(Filters.bySource(...contents), resolve);

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (filter: Filter, resolve = true): any[] => BdApi.Webpack.getModule(filter, {first: false, defaultExport: resolve}) ?? [],

    /** Finds all modules using query options. */
    query: (options: QueryWithResolve): any[] => all.find(Filters.query(options), options.resolve),

    /** Finds all modules using the name of its export. */
    byName: (name: string, resolve?: boolean): any[] => all.find(Filters.byName(name), resolve),

    /** Finds all modules using property names of its export. */
    byProps: (props: string[], resolve?: boolean): any[] => all.find(Filters.byProps(...props), resolve),

    /** Finds all modules using prototype names of it export. */
    byProtos: (protos: string[], resolve?: boolean): any[] => all.find(Filters.byProtos(...protos), resolve),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (contents: TypeOrPredicate<string>[], resolve?: boolean): any[] => all.find(Filters.bySource(...contents), resolve)
};
