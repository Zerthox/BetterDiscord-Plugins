import * as Finder from "../finder";
import {Dispatcher, Listener, Event, Token} from "./dispatch";

export declare class Store {
    constructor(dispatcher: Dispatcher, events: any);

    protected _dispatcher: Dispatcher;

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
    Dispatcher: any;
    BatchedStoreListener: any;
    ActionBase: any;

    useStateFromStores<T>(stores: Store[], callback: () => T, deps?: any[], compare?: Comparator<any>): T;
    useStateFromStoresArray<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    useStateFromStoresObject<T>(stores: Store[], callback: () => T, deps?: any[]): T;
    statesWillNeverBeEqual(a: any, b: any): boolean;
}

export const Flux: FluxHooks = Finder.byProps("Store", "useStateFromStores");
