import type {Store} from "./flux";

export * from "./npm";
export {Flux, Dispatcher, Store} from "./flux";
export * from "./discord";

export type Untyped<T> = T & Record<string, any>;

export type UntypedStore = Untyped<Store>;

export type UntypedComponent = Untyped<React.ComponentType<any>>;

export type StyleModule = Record<string, string>;

type ModuleCache<T extends Record<string, () => any>> = {
    [P in keyof T]: ReturnType<T[P]>;
};

export const createCache = <T extends Record<string, () => any>>(
    entries: T
): ModuleCache<T> => {
    const result = {};
    for (const [key, value] of Object.entries(entries)) {
        Object.defineProperty(result, key, {
            enumerable: true,
            configurable: true,
            get() {
                delete this[key];
                this[key] = value();
                return this[key];
            }
        });
    }
    return result as ModuleCache<T>;
};
