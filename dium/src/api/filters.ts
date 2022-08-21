import type {Module, Exports} from "./require";

export type Filter = (exports: Exports) => boolean;

export type RawFilter = (exports: Exports, module: Module, id: string) => boolean;

export interface Query {
    filter?: Filter | Filter[];
    name?: string;
    anyName?: string;
    props?: string[];
    protos?: string[];
    source?: string[];
}

/** Joins multiple filters together. */
export const join = (filters: Filter[]): Filter => {
    return (target) => filters.every((filter) => filter(target));
};

/** Creates a filter from query options. */
export const query = ({filter, name, anyName, props, protos, source}: Query): Filter => join([
    ...[filter].flat(),
    typeof name === "string" ? byName(name) : null,
    typeof anyName === "string" ? byAnyName(anyName) : null,
    props instanceof Array ? byProps(props) : null,
    protos instanceof Array ? byProtos(protos) : null,
    source instanceof Array ? bySource(source) : null
].filter(Boolean));

/**
 * Creates a filter searching by `displayName`.
 * This only matches on the export itself.
 */
export const byName = (name: string): Filter => {
    return (target: any) => (target?.displayName ?? target?.constructor?.displayName) === name;
};

/**
 * Creates a filter searching by any `displayName` in the module.
 * This matches on any value in the exported object.
 */
export const byAnyName = (name: string): Filter => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byName(name));
};

/** Creates a filter searching by properties. */
export const byProps = (props: string[]): Filter => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

/** Creates a filter searching by prototypes. */
export const byProtos = (protos: string[]): Filter => {
    return (target: any) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};

/** Creates a filter searching by function source fragments. */
// TODO: allow regex?
export const bySource = (contents: string[]): Filter => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};
