import * as filters from "./filters";

export type Exports = Record<string, any>;

export interface Module {
    id: number;
    loaded: boolean;
    exports: Exports;
}

export type ModuleFunction = (this: Exports, module: Module, exports: Exports, require: Require) => void;

export interface Require {
    (id: number): any;

    /** module register */
    m: Record<string, ModuleFunction>;

    /** module cache */
    c: Record<string, Module>;
}

const getWebpackRequire = (): Require => {
    const moduleId = "discordium";

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

export type Filter = (exports: Exports, module: Module) => boolean;

// TODO: option to check filter on props?
const joinFilters = (filters: Filter[]) => {
    return (module: Module) => {
        const {exports} = module;
        return (
            filters.every((filter) => filter(exports, module))
            || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module))
        );
    };
};

export interface FilterOptions {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    protos?: string[];
    source?: string[];
}

const genFilters = ({filter, name, props, protos, source}: FilterOptions): Filter[] => [
    ...[filter].flat(),
    typeof name === "string" ? filters.byName(name) : null,
    props instanceof Array ? filters.byProps(props) : null,
    protos instanceof Array ? filters.byProtos(protos) : null,
    source instanceof Array ? filters.bySource(source) : null
].filter((entry) => entry instanceof Function);

export interface ResolveOptions {
    filter?: (target: any) => boolean;
    export?: string;
    name?: string;
}

export const require = getWebpackRequire();

/** @pure */
export const getAll = () => Object.values(require.c);

/** @pure */
export const getSources = () => Object.values(require.m);

/** @pure */
export const getSource = (id: number | string) => require.m[id] ?? null;

/** @pure */
export const find = (...filters: Filter[]) => getAll().find(joinFilters(filters)) ?? null;

/** @pure */
export const query = (options: FilterOptions) => find(...genFilters(options));

/** @pure */
export const byId = (id: number | string) => require.c[id] ?? null;

/** @pure */
export const byExports = (exported: Exports) => find(filters.byExports(exported));

/** @pure */
export const byName = (name: string) => find(filters.byName(name));

/** @pure */
export const byProps = (...props: string[]) => find(filters.byProps(props));

/** @pure */
export const byProtos = (...protos: string[]) => find(filters.byProtos(protos));

/** @pure */
export const bySource = (...contents: string[]) => find(filters.bySource(contents));

export const all = {
    /** @pure */
    find: (...filters: Filter[]) => getAll().filter(joinFilters(filters)),

    /** @pure */
    query: (options: FilterOptions) => all.find(...genFilters(options)),

    /** @pure */
    byExports: (exported: Exports) => all.find(filters.byExports(exported)),

    /** @pure */
    byName: (name: string) => all.find(filters.byName(name)),

    /** @pure */
    byProps: (...props: string[]) => all.find(filters.byProps(props)),

    /** @pure */
    byProtos: (...protos: string[]) => all.find(filters.byProtos(protos)),

    /** @pure */
    bySource: (...contents: string[]) => all.find(filters.bySource(contents))
};

export const resolveExports = (module: Module | null, options: ResolveOptions = {}) => {
    if (module instanceof Object && "exports" in module) {
        const exported = module.exports;
        if (!exported) {
            return exported;
        }

        const hasDefault = exported.__esModule && "default" in exported;

        // apply options
        if (options.export) {
            return exported[options.export];
        } else if (options.name) {
            return Object.values(exported).find(filters.byDisplayName(options.name));
        } else if (options.filter && hasDefault && options.filter(exported.default)) {
            return exported.default;
        }

        // check for single default export
        if (hasDefault && Object.keys(exported).length === 1) {
            return exported.default;
        } else {
            return exported;
        }
    }

    return null;
};

export const resolveImportIds = (module: Module) => {
    // get module as source code
    const source = getSource(module.id).toString();

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

export const resolveImports = (module: Module) => resolveImportIds(module).map((id) => byId(id));

export const resolveStyles = (module: Module) => resolveImports(module).filter((imported) => (
    imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]: [string, string]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))
));

export const resolveUsers = (module: Module) => all.find((_, user) => resolveImportIds(user).includes(module.id));
