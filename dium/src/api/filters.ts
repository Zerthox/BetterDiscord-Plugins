import type {Module, Exports} from "./require";

export type Filter = (exports: Exports, module?: Module, id?: string) => boolean;

export interface Query {
    filter?: Filter | Filter[];
    name?: string;
    anyName?: string;
    keys?: string[];
    protos?: string[];
    source?: string[];
}

/** Joins multiple filters together. */
export const join = (...filters: Filter[]): Filter => {
    return (...args) => filters.every((filter) => filter(...args));
};

/** Creates a filter from query options. */
export const query = ({filter, name, anyName, keys, protos, source}: Query): Filter => join(...[
    ...[filter].flat(),
    typeof name === "string" ? byName(name) : null,
    typeof anyName === "string" ? byAny(byName(anyName)) : null,
    keys instanceof Array ? byProps(...keys) : null,
    protos instanceof Array ? byProtos(...protos) : null,
    source instanceof Array ? bySource(...source) : null
].filter(Boolean));

/** Creates a filter matching on any value in the exported object. */
export const byAny = (filter: Filter): Filter => {
    return (target, module, id) => target instanceof Object && target !== window && Object.values(target).some((value) => filter(value, module, id));
};

/**
 * Creates a filter searching by `displayName`.
 */
export const byName = (name: string): Filter => {
    return (target: any) => (target?.displayName ?? target?.constructor?.displayName) === name;
};

/** Creates a filter searching by export properties. */
export const byProps = (...props: string[]): Filter => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

/** Creates a filter searching by prototypes. */
export const byProtos = (...protos: string[]): Filter => {
    return (target: any) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};

/** Creates a filter searching by function source fragments. */
// TODO: allow regex?
export const bySource = (...contents: string[]): Filter => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};
