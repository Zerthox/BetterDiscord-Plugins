export type Filter = (data: any) => boolean;

export type TypeOrPredicate<T> = T | ((data: T) => boolean);

export interface Query {
    filter?: Filter | Filter[];
    name?: string;
    props?: string[];
    protos?: string[];
    source?: TypeOrPredicate<string>[];
}

/** Joins multiple filters together. */
export const join = <F extends (...args: any) => boolean>(...filters: F[]): F => {
    return ((...args) => filters.every((filter) => filter(...args))) as any;
};

/** Creates a filter from query options. */
export const query = ({filter, name, props, protos, source}: Query): Filter => join(...[
    ...[filter].flat(),
    typeof name === "string" ? byName(name) : null,
    props instanceof Array ? byProps(...props) : null,
    protos instanceof Array ? byProtos(...protos) : null,
    source instanceof Array ? bySource(...source) : null
].filter(Boolean));

/** Creates a filter matching on values in the exported object. */
export const byEntry = <F extends (data: any, ...args: any) => boolean>(filter: F, every = false): F => {
    return ((target, ...args) => {
        if (target instanceof Object && target !== window) {
            const values = Object.values(target);
            return values.length > 0 && values[every ? "every" : "some"]((value) => filter(value, ...args));
        } else {
            return false;
        }
    }) as any;
};

/** Creates a filter searching by `displayName`. */
export const byName = (name: string): Filter => {
    return (target: any) => (target?.displayName ?? target?.constructor?.displayName) === name;
};

/** Creates a filter searching by export properties. */
// TODO: rename to byKeys for clarity?
export const byProps = (...props: string[]): Filter => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

/** Creates a filter searching by prototypes. */
export const byProtos = (...protos: string[]): Filter => {
    return (target: any) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};

/**
 * Creates a filter searching by function source fragments.
 *
 * Also searches a potential `render()` function on the prototype in order to handle React class components.
 * For ForwardRef or Memo exotic components the wrapped component is checked.
 */
export const bySource = (...fragments: TypeOrPredicate<string>[]): Filter => {
    return (target) => {
        // handle exotic components
        while (target instanceof Object && "$$typeof" in target) {
            target = target.render ?? target.type;
        }

        if (target instanceof Function) {
            const source = target.toString();
            const renderSource = (target.prototype as React.Component)?.render?.toString();

            return fragments.every((fragment) => (
                typeof fragment === "string" ? (
                    source.includes(fragment) || renderSource?.includes(fragment)
                ) : (
                    fragment(source) || renderSource && fragment(renderSource)
                )
            ));
        } else {
            return false;
        }
    };
};
