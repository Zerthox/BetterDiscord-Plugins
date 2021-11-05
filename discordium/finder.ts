interface Require {
    (id: number): any;
    m: Record<string, any>;
    c: Record<string, any>;
}

// grab webpack require then cleanup
let webpackRequire: Require;
global.webpackJsonp.push([
    [],
    {
        __discordium__: (_module: unknown, _exports: unknown, require: Require) => {
            webpackRequire = require;
        }
    },
    [["__discordium__"]]
]);
delete webpackRequire.m.__discordium__;
delete webpackRequire.c.__discordium__;

export type Filter = (exports: any, module?: any) => boolean;

const applyFilters = (filters: Filter[]) => {
    return (module: { exports: any; }) => {
        const {exports} = module;
        return filters.every((filter) => filter(exports, module) || (exports?.__esModule && filter(exports?.default, module)));
    };
};

const filters = {
    byExports(exported: unknown): Filter {
        return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
    },
    byName(name: string): Filter {
        return (target) => target instanceof Object && Object.values(target).some(filters.byDisplayName(name));
    },
    byDisplayName(name: string): Filter {
        return (target) => target?.displayName === name || target?.constructor?.displayName === name;
    },
    byProps(props: string[]): Filter {
        return (target) => target instanceof Object && props.every((prop) => prop in target);
    },
    byPrototypes(prototypes: string[]): Filter {
        return (target) => target instanceof Object && target.prototype instanceof Object && prototypes.every((prototype) => prototype in target.prototype);
    },
    bySource(contents: string[]): Filter {
        return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
    }
};

export interface FilterOptions {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    prototypes?: string[];
    source?: string[];
}

export interface Options extends FilterOptions {
    export?: string;
}

const genFilters = ({filter, name, props, prototypes, source}: FilterOptions): Filter[] => [
    ...[filter].flat(),
    typeof name === "string" ? filters.byName(name) : null,
    props instanceof Array ? filters.byProps(props) : null,
    prototypes instanceof Array ? filters.byPrototypes(prototypes) : null,
    source instanceof Array ? filters.bySource(source) : null
].filter((entry) => entry instanceof Function);

const raw = {
    require: webpackRequire,
    getAll: () => Object.values(webpackRequire.c),
    find: (...filters: Filter[]) => raw.getAll().find(applyFilters(filters)) ?? null,
    query: (options: FilterOptions) => raw.find(...genFilters(options)),
    byId: (id: number) => webpackRequire.c[id] ?? null,
    byExports: (exported: unknown) => raw.find(filters.byExports(exported)),
    byName: (name: string) => raw.find(filters.byName(name)),
    byProps: (...props: string[]) => raw.find(filters.byProps(props)),
    byPrototypes: (...prototypes: string[]) => raw.find(filters.byPrototypes(prototypes)),
    bySource: (...contents: string[]) => raw.find(filters.bySource(contents)),
    all: {
        find: (...filters: Filter[]) => raw.getAll().filter(applyFilters(filters)),
        query: (options: FilterOptions) => raw.all.find(...genFilters(options)),
        byExports: (exported: unknown) => raw.all.find(filters.byExports(exported)),
        byName: (name: string) => raw.all.find(filters.byName(name)),
        byProps: (...props: string[]) => raw.all.find(filters.byProps(props)),
        byPrototypes: (...prototypes: string[]) => raw.all.find(filters.byPrototypes(prototypes)),
        bySource: (...contents: string[]) => raw.all.find(filters.bySource(contents))
    },
    resolveExports: (module: any, filter: string | ((entry: any) => boolean) | null = null) => {
        if (module instanceof Object && "exports" in module) {
            const exported = module.exports;
            if (!exported) {
                return exported;
            }

            // apply filter
            if (typeof filter === "string") {
                return exported[filter];
            } else if (filter instanceof Function) {
                return Object.values(exported).find((value) => filter(value)) ?? null;
            }

            // check for default export
            if (exported instanceof Object && exported.__esModule && "default" in exported && Object.keys(exported).length === 1) {
                return exported.default;
            }

            return exported;
        }

        return null;
    }
};

const Finder = {
    raw,
    getAll: () => raw.getAll().map((entry) => raw.resolveExports(entry)),
    find: (...filters: Filter[]) => raw.resolveExports(raw.find(...filters)),
    query: (options: Options) => raw.resolveExports(raw.query(options), options.export),
    byId: (id: number) => raw.resolveExports(raw.byId(id)),
    byExports: (exported: unknown) => raw.resolveExports(raw.byExports(exported)),
    byName: (name: string) => raw.resolveExports(raw.byName(name), filters.byDisplayName(name)),
    byProps: (...props: string[]) => raw.resolveExports(raw.byProps(...props)),
    byPrototypes: (...prototypes: string[]) => raw.resolveExports(raw.byPrototypes(...prototypes)),
    bySource: (...contents: string[]) => raw.resolveExports(raw.bySource(...contents), filters.bySource(contents)),
    all: {
        find: (...filters: Filter[]) => raw.all.find(...filters).map((entry) => raw.resolveExports(entry)),
        query: (options: Options) => raw.all.query(options).map((entry) => raw.resolveExports(entry, options.export)),
        byExports: (exported: unknown) => raw.all.byExports(exported).map((entry) => raw.resolveExports(entry)),
        byName: (name: string) => raw.all.byName(name).map((entry) => raw.resolveExports(entry, filters.byDisplayName(name))),
        byProps: (...props: string[]) => raw.all.byProps(...props).map((entry) => raw.resolveExports(entry)),
        byPrototypes: (...prototypes: string[]) => raw.all.byPrototypes(...prototypes).map((entry) => raw.resolveExports(entry)),
        bySource: (...contents: string[]) => raw.all.bySource(...contents).map((entry) => raw.resolveExports(entry, filters.bySource(contents)))
    }
};

export default Finder;

export type Finder = typeof Finder;
