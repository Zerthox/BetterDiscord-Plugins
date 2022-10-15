import * as Finder from "../finder";
import * as Filters from "../filters";

export type ActionType = string;

export interface Action {
    type: ActionType;
}

export type ActionHandler<A extends Action = any> = (action: A) => void;

type ActionHandlerRecord = {
    [A in ActionType]: ActionHandler<{type: A}>;
};

export type DispatchToken = string;

type StoreDidChange = (arg: any) => boolean;

interface DepGraph {
    nodes: Record<DispatchToken, DepGraphNode>;
    incomingEdges: Record<DispatchToken, DispatchToken[]>;
    outgoingEdges: Record<DispatchToken, DispatchToken[]>;
    circular: any;

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

interface DepGraphNode {
    name: string;
    actionHandler: ActionHandlerRecord;
    storeDidChange: StoreDidChange;
}

interface HandlerEntry {
    name: string;
    actionHandler: ActionHandler;
    storeDidChange: StoreDidChange;
}

interface ActionHandlers {
    _dependencyGraph: DepGraph;
    _lastID: number;
    _orderedActionHandlers: Record<string, HandlerEntry[]>;
    _orderedCallbackTokens: DispatchToken[];

    _computeOrderedActionHandlers(actionType: ActionType): HandlerEntry[];
    _computeOrderedCallbackTokens(): DispatchToken[];
    _invalidateCaches(): void;

    register: Dispatcher["register"];
    addDependencies(arg1: any, arg2: any): void;
    getOrderedActionHandlers(actionType: ActionType): HandlerEntry[];
}

export interface Dispatcher {
    _currentDispatchActionType: any;
    _actionHandlers: ActionHandlers;
    _subscriptions: Record<string, any>;
    _processingWaitQueue: boolean;
    _waitQueue: any[];
    _interceptor: (arg: any) => any;

    _dispatch<A extends Action>(action: A): void;
    _dispatchWithDevtools<A extends Action>(action: A): void;
    _dispatchWithLogging<A extends Action>(action: A): void;

    dispatch<A extends Action>(action: A): void;
    isDispatching(): boolean;
    flushWaitQueue(): void;

    register(name: string, actionHandler: ActionHandlerRecord, storeDidChange: StoreDidChange): DispatchToken;
    addDependencies(arg1: any, arg2: any): void;
    setInterceptor(interceptor: any): void;

    subscribe<A extends Action>(action: A["type"], handler: ActionHandler<A>): void;
    unsubscribe<A extends Action>(action: A["type"], handler: ActionHandler<A>): void;

    wait<T>(callback: () => T): T | void;
}

export interface DispatcherConstructor {
    new(): Dispatcher;
}

type Callback = () => void;

interface Callbacks {
    listeners: Set<Callback>;
    add(callback: Callback): void;
    addConditional(callback: Callback, condition: boolean): void;
    remove(callback: Callback);
    has(callback: Callback): boolean;
    hasAny(): boolean;
    invokeAll(): void;
}

declare class Store {
    constructor(dispatcher: Dispatcher, actions: ActionHandlerRecord);

    static destroy(): any;
    static getAll(): any;
    static initialize(): any;
    static initialized: Promise<any>;

    // private
    _isInitialized: boolean;
    _dispatchToken: DispatchToken;
    _dispatcher: Dispatcher;
    _changeCallbacks: Callbacks;

    initialize(): void;
    initializeIfNeeded(): void;
    getDispatchToken(): DispatchToken;
    getName(): string;

    emitChange(): void;
    mustEmitChanges(func?: () => boolean): void;
    syncWith(stores: Store[], func: () => boolean, timeout?: number): any;
    waitFor(...stores: Store[]): void;

    addChangeListener(listener: Callback): void;
    addConditionalChangeListener(listener: Callback, condition: boolean): void;
    addReactChangeListener(listener: Callback): void;
    removeChangeListener(listener: Callback): void;
    removeReactChangeListener(listener: Callback): void;
}

declare class BatchedStoreListener {
    constructor(stores: Store[], changeCallback: Callback);

    attach(name: string): void;
    detach(): void;
}

export type {Store, BatchedStoreListener};

export interface OldFlux {
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
    default: OldFlux;

    Store: typeof Store;
    Dispatcher: DispatcherConstructor;
    BatchedStoreListener: typeof BatchedStoreListener;

    useStateFromStores<T>(stores: Store[], callback: () => T, deps?: unknown[], compare?: Comparator<T>): T;
    useStateFromStoresArray<T>(stores: Store[], callback: () => T, deps?: unknown[]): T;
    useStateFromStoresObject<T>(stores: Store[], callback: () => T, deps?: unknown[]): T;
    statesWillNeverBeEqual: Comparator<unknown>;
}

export const Dispatcher: Dispatcher = /* @__PURE__ */ Finder.byProps(["dispatch", "subscribe"]);

export type Flux = Pick<FluxHooks, "default" | "Store" | "Dispatcher" | "BatchedStoreListener" | "useStateFromStores">;

export const Flux: Flux = /* @__PURE__ */ Finder.demangle({
    default: Filters.byProps("Store", "connectStores"),
    Dispatcher: Filters.byProtos("dispatch"),
    Store: Filters.byProtos("emitChange"),
    BatchedStoreListener: Filters.byProtos("attach", "detach"),
    useStateFromStores: Filters.bySource("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);
