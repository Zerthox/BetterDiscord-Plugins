import type {Store} from "./flux";

export * from "./npm";
export {Flux, Dispatcher, Store} from "./flux";
export * from "./discord";

export type Untyped<T> = T & Record<string, any>;

export type UntypedStore = Untyped<Store>;

export type UntypedComponent = Untyped<React.ComponentType<any>>;

export type StyleModule = Record<string, string>;
