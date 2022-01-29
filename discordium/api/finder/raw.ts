import * as filters from "./filters";

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

const webpackRequire = getWebpackRequire();

export {webpackRequire as require};

export const getAll = (): Module[] => Object.values(webpackRequire.c);

export const getSources = (): ModuleFunction[] => Object.values(webpackRequire.m);

export const getSource = (id: ModuleId | string): ModuleFunction => webpackRequire.m[id] ?? null;

export const find = (...filters: Filter[]): Module => getAll().find(joinFilters(filters)) ?? null;

export const query = (options: FilterOptions): Module => find(...genFilters(options));

export const byId = (id: ModuleId | string): Module => webpackRequire.c[id] ?? null;

export const byExports = (exported: Exports): Module => find(filters.byExports(exported));

export const byName = (name: string): Module => find(filters.byName(name));

export const byProps = (...props: string[]): Module => find(filters.byProps(props));

export const byProtos = (...protos: string[]): Module => find(filters.byProtos(protos));

export const bySource = (...contents: string[]): Module => find(filters.bySource(contents));

export const all = {
    find: (...filters: Filter[]): Module[] => getAll().filter(joinFilters(filters)),
    query: (options: FilterOptions): Module[] => all.find(...genFilters(options)),
    byExports: (exported: Exports): Module[] => all.find(filters.byExports(exported)),
    byName: (name: string): Module[] => all.find(filters.byName(name)),
    byProps: (...props: string[]): Module[] => all.find(filters.byProps(props)),
    byProtos: (...protos: string[]): Module[] => all.find(filters.byProtos(protos)),
    bySource: (...contents: string[]): Module[] => all.find(filters.bySource(contents))
};

export const resolveExports = (module: Module | null, options: ResolveOptions = {}): any => {
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

export const resolveImportIds = (module: Module): ModuleId[] => {
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

export const resolveImports = (module: Module): Module[] => resolveImportIds(module).map((id) => byId(id));

export const resolveStyles = (module: Module): Module[] => resolveImports(module).filter((imported) => (
    imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]: [string, string]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))
));

export const resolveUsersById = (id: ModuleId): Module[] => all.find((_, user) => resolveImportIds(user).includes(id));

export const resolveUsers = (module: Module): Module[] => resolveUsersById(module.id);
