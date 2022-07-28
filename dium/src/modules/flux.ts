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
    constructor(dispatcher: Dispatcher, actions: unknown);

    static destroy(): any;
    static emitChanges(): any;
    static getAll(): any;
    static getChangeSentinel(): any;
    static initialize(): any;
    static initialized: Promise<unknown>;
    static injectBatchEmitChanges(arg: unknown): any;
    static isPaused(): boolean;
    static pauseEmittingChanges(arg: unknown): any;
    static resumeEmittingChanges(arg: unknown): any;

    // private
    _changeCallbacks: Set<Listener<Action>>;
    _dispatchToken: Token;
    _isInitialized: boolean;
    _dispatcher: Dispatcher;

    initialize(): void;
    initializeIfNeeded(): void;

    getDispatchToken(): Token;

    addChangeListener(listener: Listener<Action>): void;
    addConditionalChangeListener(listener: Listener<Action>, condition: boolean): void;
    removeChangeListener(listener: Listener<Action>): void;
    hasChangeCallbacks(): boolean;

    emitChange(): void;
    mustEmitChanges(func: () => boolean): void;
    syncWith(stores: Store[], func: () => boolean, timeout?: number): any;
    waitFor(...stores: Store[]): void;
}

declare class BatchedStoreListener {
    constructor(stores: Store[], changeCallback: () => void);

    attach(name: string): void;
    detach(): void;
}

export type {Store, BatchedStoreListener};

export interface Flux {
    Store: typeof Store;
    CachedStore: any;
    PersistedStore: any;
    StoreListenerMixin: any;
    LazyStoreListenerMixin: any;

    destroy(): void;
    initialize(): void;
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
    ActionHandlers: any;

    useStateFromStores<T>(stores: Store[], callback: () => T, deps?: unknown[], compare?: Comparator<T>): T;
    useStateFromStoresArray<T>(stores: Store[], callback: () => T, deps?: unknown[]): T;
    useStateFromStoresObject<T>(stores: Store[], callback: () => T, deps?: unknown[]): T;
    statesWillNeverBeEqual: Comparator<unknown>;
}

export const Flux: FluxHooks = /* @__PURE__ */ Finder.byProps("Store", "useStateFromStores");

export const Dispatcher: Dispatcher = /* @__PURE__ */ Finder.byProps("dirtyDispatch");
