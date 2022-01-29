import * as Finder from "../api/finder";

export interface Event extends Record<string, any> {
    type: string;
}

export type Listener<E extends Event> = (event: E) => void;

export type Token = string;

declare class Dispatcher {
    constructor();

    dispatch<E extends Event>(event: E): void;
    dirtyDispatch<E extends Event>(event: E): void;
    maybeDispatch<E extends Event>(event: E): any;
    isDispatching(): boolean;

    register(name: any, actionHandler: any, storeDidChange: any): Token;
    addDependencies(arg1: any, arg2: any): void;
    setInterceptor(interceptor: any): void;

    subscribe<E extends Event>(event: E["type"], listener: Listener<E>): void;
    unsubscribe<E extends Event>(event: E["type"], listener: Listener<E>): void;

    wait<T>(callback: () => T): T | void;
}

declare class Store {
    constructor(dispatcher: Dispatcher, events: any);

    _dispatcher: Dispatcher;

    initialize(): void;
    initializeIfNeeded(): void;

    getDispatchToken(): Token;

    addChangeListener(listener: Listener<Event>): void;
    addConditionalChangeListener(listener: Listener<Event>, condition: any): void;
    removeChangeListener(listener: Listener<Event>): void;
    hasChangeCallbacks(): boolean;

    emitChange(): void;
    mustEmitChanges(arg: any): void;
    syncWith(arg1: any, arg2: any, arg3: any): any;
    waitFor(...stores: Store[]): void;
}

declare class BatchedStoreListener {
    constructor(e: any, t: any);

    attach(e: any): any;
    detach(): any;
}

export interface Flux {
    Store: typeof Store;
    CachedStore: any;
    PersistedStore: any;
    StoreListenerMixin: any;
    LazyStoreListenerMixin: any;

    destroy(): any;
    initialize(): any;
    initialized: boolean;

    connectStores<OuterProps, InnerProps>(
        stores: Store[],
        callback: (props: OuterProps) => InnerProps
    ): (component: React.ComponentType<InnerProps & OuterProps>) => React.ComponentClass<OuterProps>;
}

export type Comparator<T> = (a: T, B: T) => boolean;

export interface FluxHooks {
    default: Flux;

    Store: typeof Store;
    Dispatcher: typeof Dispatcher;
    BatchedStoreListener: typeof BatchedStoreListener;
    ActionBase: any;

    useStateFromStores<T>(stores: Store[], callback: () => T, deps?: any[], compare?: Comparator<any>): T;
    useStateFromStoresArray<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    useStateFromStoresObject<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    statesWillNeverBeEqual(a: any, b: any): boolean;
}

export const Flux = (): FluxHooks => Finder.byProps("Store", "useStateFromStores");

export const Events = (): Dispatcher => Finder.byProps("dirtyDispatch");
