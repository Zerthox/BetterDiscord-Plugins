import {Filters, Finder} from "../api";

export type ActionType = string;

export interface Action {
    type: ActionType;
}

export type ActionHandler<A extends Action = any> = (action: A) => void;

export type ActionHandlerRecord = {
    [A in ActionType]: ActionHandler<{type: A}>;
};

export type DispatchToken = string;

export type StoreDidChange = (arg: any) => boolean;

export interface DepGraph {
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

export interface DepGraphNode {
    name: string;
    actionHandler: ActionHandlerRecord;
    storeDidChange: StoreDidChange;
}

export interface HandlerEntry {
    name: string;
    actionHandler: ActionHandler;
    storeDidChange: StoreDidChange;
}

export interface ActionHandlers {
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
    _subscriptions: Record<string, Set<ActionHandler>>;
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

export interface DispatcherClass {
    new(): Dispatcher;
}

export type Callback = () => void;

export interface Callbacks {
    listeners: Set<Callback>;
    add(callback: Callback): void;
    addConditional(callback: Callback, condition: boolean): void;
    remove(callback: Callback): any;
    has(callback: Callback): boolean;
    hasAny(): boolean;
    invokeAll(): void;
}

export interface StoreClass {
    new(dispatcher: Dispatcher, actions: ActionHandlerRecord): Store;
    destroy(): any;
    getAll(): any;
    initialize(): any;
    initialized: Promise<any>;
}

export interface Store extends StoreLike {
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
    removeChangeListener(listener: Callback): void;
}

export interface StoreLike {
    addReactChangeListener(listener: Callback): void;
    removeReactChangeListener(listener: Callback): void;
}

export interface BatchedStoreListenerClass {
    new(stores: StoreLike[], changeCallback: Callback): BatchedStoreListener;
}

export interface BatchedStoreListener {
    attach(name: string): void;
    detach(): void;
}

export interface LegacyModule {
    Store: StoreClass;
    PersistedStore: any;
    OfflineCacheStore: any;
    DeviceSettingsStore: any;

    Emitter: any;
    initialize(): void;
    get initialized(): boolean;
    destroy(): void;

    connectStores<OuterProps, InnerProps>(
        stores: StoreLike[],
        callback: (props: OuterProps) => InnerProps,
        options?: {forwardRef: boolean}
    ): (component: React.ComponentType<InnerProps & OuterProps>) => React.ComponentClass<OuterProps>;
}

export type Comparator<T> = (a: T, b: T) => boolean;

export interface Module {
    default: LegacyModule;

    Store: StoreClass;
    Dispatcher: DispatcherClass;
    BatchedStoreListener: BatchedStoreListenerClass;

    useStateFromStores<T>(stores: StoreLike[], callback: () => T, deps?: React.DependencyList, compare?: Comparator<T>): T;
    useStateFromStoresArray<T>(stores: StoreLike[], callback: () => T, deps?: React.DependencyList): T;
    useStateFromStoresObject<T>(stores: StoreLike[], callback: () => T, deps?: React.DependencyList): T;
    statesWillNeverBeEqual: Comparator<unknown>;
}

export const {
    default: Legacy,
    Dispatcher,
    Store,
    BatchedStoreListener,
    useStateFromStores
}: Partial<Module> = /* @__PURE__ */ Finder.demangle({
    default: Filters.byKeys("Store", "connectStores"),
    Dispatcher: Filters.byProtos("dispatch"),
    Store: Filters.byProtos("emitChange"),
    BatchedStoreListener: Filters.byProtos("attach", "detach"),
    useStateFromStores: Filters.bySource("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

export interface SnapshotStoreClass {
    new(): SnapshotStore;
    allStores: SnapshotStore[];
    clearAll(): void;
}

export interface SnapshotStore extends Store {
    registerActionHandlers(handlers: Record<string, any>): any;
    clear(): void;
    save(): void;
    takeSnapshot?(): any;
    readSnapshot(version: number): any;
    getClass(): SnapshotStoreClass;
}

export const SnapshotStore: SnapshotStoreClass = /* @__PURE__ */ Finder.byProtos(["readSnapshot"]);
