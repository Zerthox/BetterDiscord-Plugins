import type {Module, Exports} from "./require";

export type Filter = (exports: Exports, module?: Module, id?: string) => boolean;

export type TypeOrPredicate<T> = T | ((data: T) => boolean);

export interface Query {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    protos?: string[];
    source?: TypeOrPredicate<string>[];
}

/** Joins multiple filters together. */
export const join = (...filters: Filter[]): Filter => {
    return (...args) => filters.every((filter) => filter(...args));
};

/** Creates a filter from query options. */
export const query = ({filter, name, props, protos, source}: Query): Filter => join(...[
    ...[filter].flat(),
    typeof name === "string" ? byName(name) : null,
    props instanceof Array ? byProps(...props) : null,
    protos instanceof Array ? byProtos(...protos) : null,
    source instanceof Array ? bySource(...source) : null
].filter(Boolean));

/** Creates a filter matching on any value in the exported object. */
export const byAny = (filter: Filter): Filter => {
    return (target, module, id) => target instanceof Object && target !== window && Object.values(target).some((value) => filter(value, module, id));
};

/** Creates a filter searching by `displayName`. */
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
export const bySource = (...fragments: TypeOrPredicate<string>[]): Filter => {
    return (target) => target instanceof Function && fragments.every((fragment) => (
        typeof fragment === "string" ? target.toString().includes(fragment) : fragment(target.toString())
    ));
};
