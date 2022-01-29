import {Exports, Filter, Query} from ".";

export const join = (filters: Filter[]) => {
    const apply = filters.filter((filter) => filter instanceof Function);
    return (exports: any) => apply.every((filter) => filter(exports));
};

export const generate = ({filter, name, props, protos, source}: Query): Filter[] => [
    ...[filter].flat(),
    typeof name === "string" ? byName(name) : null,
    props instanceof Array ? byProps(props) : null,
    protos instanceof Array ? byProtos(protos) : null,
    source instanceof Array ? bySource(source) : null
];

export const byExports = (exported: Exports) => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
};

// TODO: custom export resolve behavior for names, matched object value instead of whole object
export const byName = (name: string) => {
    return (target) => target instanceof Object && Object.values(target).some(byDisplayName(name));
};

export const byDisplayName = (name: string) => {
    return (target: any) => target?.displayName === name || target?.constructor?.displayName === name;
};

export const byProps = (props: string[]) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

export const byProtos = (protos: string[]) => {
    return (target: any) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};

export const bySource = (contents: string[]) => {
    // TODO: allow regex?
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};
