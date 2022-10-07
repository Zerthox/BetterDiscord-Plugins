import * as Finder from "../finder";

export type ActionType = string;

export interface Action {
    type: ActionType;
}

export type Handler<A extends Action = any> = (action: A) => void;

export type HandlerRecord = {
    [A in ActionType]: Handler<{type: A}>;
};

export type Token = string;

export type StoreDidChange = (arg: any) => boolean;

export interface DepGraph {
    nodes: Record<Token, any>;
    incomingEdges: Record<Token, Token[]>;
    outgoingEdges: Record<Token, Token[]>;
    circular?: any;

    size(): number;
    clone(): DepGraph;
    overallOrder(e: any): any;

    getNodeData(e: any): any;
    setNodeData(e: any, t: any): any;
    hasNode(e: any): boolean;
    addNode(e: any, t: any): any;
    removeNode(e: any): any;

    addDependency(e: any, t: any): any;
    dependantsOf(e: any, t: any): any;
    dependenciesOf(e: any, t: any): any;
    removeDependency(e: any, t: any): any;
}

export interface DepGraphNode {
    name: string;
    actionHandler: HandlerRecord;
    storeDidChange: StoreDidChange;
}

export interface HandlerEntry {
    name: string;
    actionHandler: Handler;
    storeDidChange: StoreDidChange;
}

export interface Dispatcher {
    // private
    _currentDispatchActionType?: any;
    _dependencyGraph: DepGraph;
    _lastID?: number;
    _orderedActionHandlers: Record<string, HandlerEntry[]>;
    _orderedCallbackTokens: Token[];
    _processingWaitQueue: boolean;
    _subscriptions: Record<string, Set<Handler>>;
    _waitQueue: any[];
    _interceptor: (arg: any) => any;

    _computeOrderedActionHandlers(actionType: ActionType): HandlerEntry[];
    _computeOrderedCallbackTokens(): Token[];
    _dispatch<A extends Action>(action: A): void;
    _dispatchWithDevtools<A extends Action>(action: A): void;
    _dispatchWithLogging<A extends Action>(action: A): void;
    _invalidateCaches(): void;
    _processWaitQueue(): void;

    dispatch<A extends Action>(action: A): void;
    maybeDispatch<A extends Action>(action: A): any;
    isDispatching(): boolean;

    register(name: string, actionHandler: HandlerRecord, storeDidChange: StoreDidChange): Token;
    addDependencies(arg1: any, arg2: any): void;
    setInterceptor(interceptor: any): void;

    subscribe<A extends Action>(action: A["type"], handler: Handler<A>): void;
    unsubscribe<A extends Action>(action: A["type"], handler: Handler<A>): void;

    wait<T>(callback: () => T): T | void;
}

export interface DispatcherConstructor {
    new(): Dispatcher;
}

export type Callback = () => void;

declare class Store {
    constructor(dispatcher: Dispatcher, actions: HandlerRecord);

    static destroy(): any;
    static emitChanges(): any;
    static getAll(): any;
    static getChangeSentinel(): any;
    static initialize(): any;
    static initialized: Promise<any>;
    static injectBatchEmitChanges(arg: unknown): any;
    static isPaused(): boolean;
    static pauseEmittingChanges(arg: unknown): any;
    static resumeEmittingChanges(arg: unknown): any;

    // private
    _changeCallbacks: Set<Handler>;
    _dispatchToken: Token;
    _isInitialized: boolean;
    _dispatcher: Dispatcher;

    initialize(): void;
    initializeIfNeeded(): void;

    getDispatchToken(): Token;

    addChangeListener(listener: Callback): void;
    addConditionalChangeListener(listener: Callback, condition: boolean): void;
    removeChangeListener(listener: Callback): void;
    hasChangeCallbacks(): boolean;

    emitChange(): void;
    mustEmitChanges(func: () => boolean): void;
    syncWith(stores: Store[], func: () => boolean, timeout?: number): any;
    waitFor(...stores: Store[]): void;
}

declare class BatchedStoreListener {
    constructor(stores: Store[], changeCallback: Callback);

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

export type Comparator<T> = (a: T, b: T) => boolean;

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

const OldFlux: Flux = /* @__PURE__ */ Finder.byProps("Store");

type FluxPolyfill = Pick<FluxHooks, "default" | "Store" | "Dispatcher" | "useStateFromStores">;

export const Flux: FluxPolyfill = {
    default: OldFlux,
    Store: OldFlux?.Store,
    Dispatcher: /* @__PURE__ */ Finder.byProtos("dispatch", "unsubscribe"),
    useStateFromStores: /* @__PURE__ */ Finder.bySource("useStateFromStores")
};

export const Dispatcher: Dispatcher = /* @__PURE__ */ Finder.byProps("dispatch", "subscribe");
