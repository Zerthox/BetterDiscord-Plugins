import * as Filters from "./filters";
import {mappedProxy} from "./utils/general";
import type {Query, TypeOrPredicate} from "./filters";
import type {Module, Exports} from "./require";

export type Filter = (exports: Exports, module: Module, id: string) => boolean;

export interface FindOptions {
    /** Whether to resolve the matching export or return the whole exports object. */
    resolve?: boolean;

    /** Whether to check all export entries. */
    entries?: boolean;
}

/** Finds a module using a set of filter functions. */
export const find = (filter: Filter, {resolve = true, entries = false}: FindOptions = {}): any => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});

/** Finds a module using query options. */
export const query = (query: Query, options?: FindOptions): any => find(Filters.query(query), options);

/** Finds a module using filters matching its entries. */
export const byEntries = (...filters: Filter[]): any => find(Filters.join(...filters.map((filter) => Filters.byEntry(filter))));

/** Finds a module using the name of its export.  */
export const byName = (name: string, options?: FindOptions): any => find(Filters.byName(name), options);

/** Finds a module using property names of its export. */
export const byProps = (props: string[], options?: FindOptions): any => find(Filters.byProps(...props), options);

/** Finds a module using prototype names of its export. */
export const byProtos = (protos: string[], options?: FindOptions): any => find(Filters.byProtos(...protos), options);

/** Finds a module using source code contents of its export entries. */
export const bySource = (contents: TypeOrPredicate<string>[], options?: FindOptions): any => find(Filters.bySource(...contents), options);

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (filter: Filter, {resolve = true, entries = false}: FindOptions = {}): any[] => BdApi.Webpack.getModule(filter, {
        first: false,
        defaultExport: resolve,
        searchExports: entries
    }) ?? [],

    /** Finds all modules using query options. */
    query: (query: Query, options?: FindOptions): any[] => all.find(Filters.query(query), options),

    /** Finds all modules using the name of its export. */
    byName: (name: string, options?: FindOptions): any[] => all.find(Filters.byName(name), options),

    /** Finds all modules using property names of its export. */
    byProps: (props: string[], options?: FindOptions): any[] => all.find(Filters.byProps(...props), options),

    /** Finds all modules using prototype names of it export. */
    byProtos: (protos: string[], options?: FindOptions): any[] => all.find(Filters.byProtos(...protos), options),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (contents: TypeOrPredicate<string>[], options?: FindOptions): any[] => all.find(Filters.bySource(...contents), options)
};

type Mapping = Record<string, ((entry: any) => boolean)>;
type Mapped<M extends Mapping> = {[K in keyof M]: any};

/**
 * Finds a module and demangles its export entries by applying filters.
 *
 * Keys in `required` are the filters required to match a module.
 * By default all filters are required.
 *
 * Using `proxy` the result can be wrapped a proxy making it compatible with e.g. patching.
 */
export const demangle = <M extends Mapping>(mapping: M, required?: (keyof M)[], proxy = false): Mapped<M> => {
    const req = required ?? Object.keys(mapping);

    const found = find((target) => (
        target instanceof Object
        && target !== window
        && req.every((req) => {
            const filter = mapping[req];
            return typeof filter === "string"
                ? filter in target
                : Object.values(target).some((value) => filter(value));
        })
    ));

    return proxy ? mappedProxy(found, Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        Object.entries(found ?? {}).find(([, value]) => filter(value))?.[0]
    ]))) : Object.fromEntries(
        Object.entries(mapping).map(([key, filter]) => [
            key,
            Object.values(found ?? {}).find((value) => filter(value))
        ])
    ) as any;
};
