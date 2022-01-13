import {Exports} from "./raw";

export const byExports = (exported: Exports) => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
};

export const byName = (name: string) => {
    return (target) => target instanceof Object && Object.values(target).some(byDisplayName(name) as any);
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
