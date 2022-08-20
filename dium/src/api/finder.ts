import * as Filters from "./filters";
import {Filter, Query} from "./filters";
import {Exports} from "./require";

const resolveExports = (
    target: any,
    filter?: string | ((target: any) => boolean)
) => {
    if (target) {
        if (typeof filter === "string") {
            return target[filter];
        } else if (filter instanceof Function) {
            return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
        }
    }
    return target;
};

/** Finds a module using a set of filter functions. */
export const find = (filter: Filter): any => BdApi.Webpack.getModule(filter);

/** Finds a module using query options. */
export const query = (options: Query): any => resolveExports(find(Filters.query(options)), options.export);

/** Finds a module using its exports. */
export const byExports = (exported: Exports): any => find(Filters.byExports(exported));

/** Finds a module using the name of its export.  */
export const byName = (name: string, resolve = true): any => resolveExports(find(Filters.byName(name)), resolve ? Filters.byOwnName(name) : null);

/** Finds a module using property names of its export. */
export const byProps = (...props: string[]): any => find(Filters.byProps(props));

/** Finds a module using prototype names of its export. */
export const byProtos = (...protos: string[]): any => find(Filters.byProtos(protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]): any => find(Filters.bySource(contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (filter: Filter): any[] => BdApi.Webpack.getModule(filter, {first: false}) ?? [],

    /** Finds all modules using query options. */
    query: (options: Query): any[] => all.find(Filters.query(options)).map((entry) => resolveExports(entry, options.export)),

    /** Finds all modules using the exports. */
    byExports: (exported: Exports): any[] => all.find(Filters.byExports(exported)),

    /** Finds all modules using the name of its export. */
    byName: (name: string, resolve = true): any[] => all.find(Filters.byName(name)).map((entry) => resolveExports(entry, resolve ? Filters.byOwnName(name) : null)),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]): any[] => all.find(Filters.byProps(props)),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]): any[] => all.find(Filters.byProtos(protos)),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: string[]): any[] => all.find(Filters.bySource(contents))
};
