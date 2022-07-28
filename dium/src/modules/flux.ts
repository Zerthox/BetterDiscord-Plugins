/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as Finder from "../api/finder";

export interface Action extends Record<string, any> {
    type: string;
}

export type Listener<A extends Action> = (action: A) => void;

export type Token = string;

export type DepGraph = any;

export interface Handler {
    name: string;
    actionHandler: (e: any) => any;
    storeDidChange: (e: any) => boolean;
}

export interface Dispatcher {
    // private
    _currentDispatchActionType?: any;
    _dependencyGraph: DepGraph;
    _dispatch<A extends Action>(action: A): void;
    _interceptor(e: any): any;
    _lastID?: number;
    _orderedActionHandlers: Record<string, Handler[]>;
    _orderedCallbackTokens: Token[];
    _processingWaitQueue: boolean;
    _subscriptions: Record<string, Set<Listener<Action>>>;
    _waitQueue: any[];

    dispatch<A extends Action>(action: A): void;
    dirtyDispatch<A extends Action>(action: A): void;
    maybeDispatch<A extends Action>(action: A): any;
    isDispatching(): boolean;

    register(name: any, actionHandler: any, storeDidChange: any): Token;
    addDependencies(arg1: any, arg2: any): void;
    setInterceptor(interceptor: any): void;

    subscribe<A extends Action>(action: A["type"], listener: Listener<A>): void;
    unsubscribe<A extends Action>(action: A["type"], listener: Listener<A>): void;

    wait<T>(callback: () => T): T | void;
}

export interface DispatcherConstructor {
    new(): Dispatcher;
}

declare class Store {
    constructor(dispatcher: Dispatcher, actions: any);

    // private
    _changeCallbacks: Set<Listener<Action>>;
    _dispatchToken: Token;
    _isInitialized: boolean;
    _dispatcher: Dispatcher;

    initialize(): void;
    initializeIfNeeded(): void;

    getDispatchToken(): Token;

    addChangeListener(listener: Listener<Action>): void;
    addConditionalChangeListener(listener: Listener<Action>, condition: any): void;
    removeChangeListener(listener: Listener<Action>): void;
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

export type {Store, BatchedStoreListener};

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
        callback: (props: OuterProps) => InnerProps,
        options?: {forwardRef: boolean}
    ): (component: React.ComponentType<InnerProps & OuterProps>) => React.ComponentClass<OuterProps>;
}

export type Comparator<T> = (a: T, B: T) => boolean;

export interface FluxHooks {
    default: Flux;

    Store: typeof Store;
    Dispatcher: DispatcherConstructor;
    BatchedStoreListener: typeof BatchedStoreListener;
    ActionBase: any;

    useStateFromStores<T>(stores: Store[], callback: () => T, deps?: any[], compare?: Comparator<T>): T;
    useStateFromStoresArray<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    useStateFromStoresObject<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    statesWillNeverBeEqual(a: any, b: any): boolean;
}

export const Flux: FluxHooks = /* @__PURE__ */ Finder.byProps("Store", "useStateFromStores");

export const Dispatcher: Dispatcher = /* @__PURE__ */ Finder.byProps("dirtyDispatch");
