import * as Filters from "./filters";

export * as Filters from "./filters";

export type ModuleId = number;

export type Exports = Record<string, any>;

export interface Module {
    id: ModuleId;
    loaded: boolean;
    exports: Exports;
}

export type ModuleFunction = (this: Exports, module: Module, exports: Exports, require: Require) => void;

export interface Require {
    (id: ModuleId): any;

    /** module register */
    m: Record<string, ModuleFunction>;

    /** module cache */
    c: Record<string, Module>;
}

export type Filter = (exports: Exports) => boolean;

export interface Query {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    protos?: string[];
    source?: string[];
    export?: string | ((target: any) => boolean);
}

// we assume bd env for now
const raw = {
    single: (filter: (module: any) => boolean) => BdApi.findModule(filter),
    all: (filter: (module: any) => boolean) => BdApi.findAllModules(filter)
};

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
export const find = (...filters: Filter[]): any => raw.single(Filters.join(filters));

/** Finds a module using query options. */
export const query = (options: Query): any => resolveExports(find(...Filters.generate(options)), options.export);

/** Finds a module using its exports. */
export const byExports = (exported: Exports): any => find(Filters.byExports(exported));

/** Finds a module using the name of its export.  */
export const byName = (name: string): any => resolveExports(find(Filters.byName(name)), Filters.byOwnName(name));

/** Finds a module using property names of its export. */
export const byProps = (...props: string[]): any => find(Filters.byProps(props));

/** Finds a module using prototype names of its export. */
export const byProtos = (...protos: string[]): any => find(Filters.byProtos(protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]): any => find(Filters.bySource(contents));

/** Returns all module results. */
export const all = {
    /** Finds all modules using a set of filter functions. */
    find: (...filters: Filter[]): any[] => raw.all(Filters.join(filters)),

    /** Finds all modules using query options. */
    query: (options: Query): any[] => all.find(...Filters.generate(options)).map((entry) => resolveExports(entry, options.export)),

    /** Finds all modules using the exports. */
    byExports: (exported: Exports): any[] => all.find(Filters.byExports(exported)),

    /** Finds all modules using the name of its export. */
    byName: (name: string): any[] => all.find(Filters.byName(name)).map((entry) => resolveExports(entry, Filters.byOwnName(name))),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]): any[] => all.find(Filters.byProps(props)),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]): any[] => all.find(Filters.byProtos(protos)),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: string[]): any[] => all.find(Filters.bySource(contents))
};
