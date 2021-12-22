export type Exports = Record<string, any>;

export interface Module {
    id: number;
    loaded: boolean;
    exports: Exports;
}

type ModuleFunction = (this: Exports, module: Module, exports: Exports, require: Require) => void;

export interface Require {
    (id: number): any;

    /** module register */
    m: Record<string, ModuleFunction>;

    /** module cache */
    c: Record<string, Module>;
}

// grab webpack require then cleanup
let webpackRequire: Require;
global.webpackJsonp.push([
    [],
    {
        __discordium__: (_module: Module, _exports: Exports, require: Require) => {
            webpackRequire = require;
        }
    },
    [["__discordium__"]]
]);
delete webpackRequire.m.__discordium__;
delete webpackRequire.c.__discordium__;

export type Filter = (exports: Exports, module?: Module) => boolean;

// TODO: option to check filter on props?
const joinFilters = (filters: Filter[]) => {
    return (module: Module) => {
        const {exports} = module;
        return filters.every((filter) => filter(exports, module) || (exports?.__esModule && filter(exports?.default, module)));
    };
};

const filters = {
    byExports(exported: Exports): Filter {
        return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
    },
    byName(name: string): Filter {
        return (target) => target instanceof Object && Object.values(target).some(filters.byDisplayName(name) as any);
    },
    byDisplayName(name: string): Filter {
        return (target: any) => target?.displayName === name || target?.constructor?.displayName === name;
    },
    byProps(props: string[]): Filter {
        return (target) => target instanceof Object && props.every((prop) => prop in target);
    },
    byProtos(protos: string[]): Filter {
        return (target: any) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
    },
    bySource(contents: string[]): Filter {
        // TODO: allow regex?
        return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
    }
};

export interface FilterOptions {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    protos?: string[];
    source?: string[];
}

export interface Options extends FilterOptions {
    export?: string;
}

const genFilters = ({filter, name, props, protos, source}: FilterOptions): Filter[] => [
    ...[filter].flat(),
    typeof name === "string" ? filters.byName(name) : null,
    props instanceof Array ? filters.byProps(props) : null,
    protos instanceof Array ? filters.byProtos(protos) : null,
    source instanceof Array ? filters.bySource(source) : null
].filter((entry) => entry instanceof Function);

export const raw = {
    require: webpackRequire,
    getAll: () => Object.values(webpackRequire.c),
    getSources: () => Object.values(webpackRequire.m),
    getSource: (id: number | string) => webpackRequire.m[id] ?? null,
    find: (...filters: Filter[]) => raw.getAll().find(joinFilters(filters)) ?? null,
    query: (options: FilterOptions) => raw.find(...genFilters(options)),
    byId: (id: number | string) => webpackRequire.c[id] ?? null,
    byExports: (exported: Exports) => raw.find(filters.byExports(exported)),
    byName: (name: string) => raw.find(filters.byName(name)),
    byProps: (...props: string[]) => raw.find(filters.byProps(props)),
    byProtos: (...protos: string[]) => raw.find(filters.byProtos(protos)),
    bySource: (...contents: string[]) => raw.find(filters.bySource(contents)),
    all: {
        find: (...filters: Filter[]) => raw.getAll().filter(joinFilters(filters)),
        query: (options: FilterOptions) => raw.all.find(...genFilters(options)),
        byExports: (exported: Exports) => raw.all.find(filters.byExports(exported)),
        byName: (name: string) => raw.all.find(filters.byName(name)),
        byProps: (...props: string[]) => raw.all.find(filters.byProps(props)),
        byProtos: (...protos: string[]) => raw.all.find(filters.byProtos(protos)),
        bySource: (...contents: string[]) => raw.all.find(filters.bySource(contents))
    },
    resolveExports(module: Module, filter: string | ((entry: any) => boolean) | null = null) {
        if (module instanceof Object && "exports" in module) {
            const exported = module.exports;
            if (!exported) {
                return exported;
            }

            // apply filter
            if (typeof filter === "string") {
                return exported[filter];
            } else if (filter instanceof Function) {
                const result = Object.values(exported).find((value) => filter(value));
                if (result !== undefined) {
                    return result;
                }
            }

            // check for default export
            if (exported.__esModule && "default" in exported && Object.keys(exported).length === 1) {
                return exported.default;
            } else {
                return exported;
            }
        }

        return null;
    },
    resolveImportIds(module: Module) {
        // get module as source code
        const source = webpackRequire.m[module.id].toString();

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
    },
    resolveImports: (module: Module) => raw.resolveImportIds(module).map((id) => raw.byId(id)),
    resolveStyles: (module: Module) => raw.resolveImports(module).filter((imported) => (
        imported instanceof Object
        && "exports" in imported
        && Object.values(imported.exports).every((value) => typeof value === "string")
        && Object.entries(imported.exports).find(([key, value]: [string, string]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))
    )),
    resolveUsers: (module: Module) => raw.all.find((_, user) => raw.resolveImportIds(user).includes(module.id))
};

/** Returns a list of exports for all modules. */
export const getAll = () => raw.getAll().map((entry) => raw.resolveExports(entry));

/** Finds a module using a set of filter functions. */
export const find = (...filters: Filter[]) => raw.resolveExports(raw.find(...filters));

/** Finds a module using query options. */
export const query = (options: Options) => raw.resolveExports(raw.query(options), options.export);

/**
 * Finds a module using its id.
 *
 * Module ids should be considered volatile across Discord updates.
 */
export const byId = (id: number | string) => raw.resolveExports(raw.byId(id));

/** Finds a module using its exports. */
export const byExports = (exported: Exports) => raw.resolveExports(raw.byExports(exported));

/** Finds a module using the name of its export. */
export const byName = (name: string) => raw.resolveExports(raw.byName(name), filters.byDisplayName(name));

/** Finds a module using property names of its export. */
export const byProps = (...props: string[]) => raw.resolveExports(raw.byProps(...props), filters.byProps(props));

/** Finds a module using prototype names of its export. */
export const byProtos = (...protos: string[]) => raw.resolveExports(raw.byProtos(...protos), filters.byProtos(protos));

/** Finds a module using source code contents of its export entries. */
export const bySource = (...contents: string[]) => raw.resolveExports(raw.bySource(...contents), filters.bySource(contents));

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
    query: (options: Options) => raw.all.query(options).map((entry) => raw.resolveExports(entry, options.export)),

    /** Finds all modules using the exports. */
    byExports: (exported: Exports) => raw.all.byExports(exported).map((entry) => raw.resolveExports(entry)),

    /** Finds all modules using the name of its export. */
    byName: (name: string) => raw.all.byName(name).map((entry) => raw.resolveExports(entry, filters.byDisplayName(name))),

    /** Finds all modules using property names of its export. */
    byProps: (...props: string[]) => raw.all.byProps(...props).map((entry) => raw.resolveExports(entry, filters.byProps(props))),

    /** Finds all modules using prototype names of it export. */
    byProtos: (...protos: string[]) => raw.all.byProtos(...protos).map((entry) => raw.resolveExports(entry, filters.byProtos(protos))),

    /** Finds all modules using source code contents of its export entries. */
    bySource: (...contents: string[]) => raw.all.bySource(...contents).map((entry) => raw.resolveExports(entry, filters.bySource(contents)))
};
