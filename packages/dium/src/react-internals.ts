import type {Usable} from "react";
import {React, ReactDOM} from "./modules";
import type {Fiber, ReactContext, EventPriority} from "react-reconciler";

export type {Fiber} from "react-reconciler";

export interface ForwardRefExoticComponent<P, T = any> extends React.ForwardRefExoticComponent<P> {
    render: React.ForwardRefRenderFunction<T, P>;
}

type CompareFn = Parameters<typeof React.memo>[1];

export interface MemoExoticComponent<T extends React.ComponentType<any>> extends React.MemoExoticComponent<T> {
    compare?: CompareFn;
}

/** A fiber node with React component as state node. */
export interface OwnerFiber extends Fiber {
    stateNode: React.Component<any, any>;
}

export interface MutableSource<Source> {
    _source: Source;
    _getVersion: (source: Source) => any;
    _workInProgressVersionPrimary?: any;
    _workInProgressVersionSecondary?: any;
}
export type TransitionStatus = any;

export interface Dispatcher {
    use<T>(usable: Usable<T>): T;
    readContext<T>(context: ReactContext<T>, observedBits?: number | boolean): T;
    useState: typeof React.useState;
    useReducer: typeof React.useReducer;
    useContext: typeof React.useContext;
    useRef: typeof React.useRef;
    useEffect: typeof React.useEffect;
    useEffectEvent?<Args, F extends (...args: Args[]) => any>(callback: F): F;
    useInsertionEffect: typeof React.useInsertionEffect;
    useLayoutEffect: typeof React.useLayoutEffect;
    useCallback: typeof React.useCallback;
    useMemo: typeof React.useMemo;
    useImperativeHandle: typeof React.useImperativeHandle;
    useDebugValue: typeof React.useDebugValue;
    useDefferedValue: typeof React.useDeferredValue;
    useTransition: typeof React.useTransition;
    useSyncExternalStore: typeof React.useSyncExternalStore;
    useId: typeof React.useId;
    useCacheRefresh?(): <T>(f: () => T, t?: T) => void;
    useMemoCache?(size: number): any[];
    useHostTransitionStatus?(): TransitionStatus;
    useOptimistic?: typeof React.useOptimistic;
    useFormState?<S, P>(
        action: (awaited: Awaited<S>, p: P) => S,
        initialState: Awaited<S>,
        permalink?: string,
    ): [Awaited<S>, (p: P) => void, boolean];
    useActionState?: typeof React.useActionState;
}

export interface AsyncDispatcher {
    getCacheForType<T>(resourceType: () => T): T;
}

export interface BatchConfigTransition {
    name?: string;
    startTime?: number;
    _updatedFibers?: Set<Fiber>;
}

export interface ReactInternals {
    H?: Dispatcher; // ReactCurrentDispatcher for Hooks
    A?: AsyncDispatcher; // ReactCurrentCache for Cache
    T?: BatchConfigTransition; // ReactCurrentBatchConfig for Transitions
    S?(transition: BatchConfigTransition, mixed: any): void; // onStartTransitionFinish
}

export const ReactInternals: ReactInternals = (React as any)?.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

export type CrossOriginEnum = any;
export type PreloadImplOptions = any;
export type PreloadModuleImplOptions = any;
export type PreinitStyleOptions = any;
export type PreinitScriptOptions = any;
export type PreinitModuleScriptOptions = any;

export interface HostDispatcher {
    f(): boolean | void; // flushSyncWork
    R(form: HTMLFormElement): void; // requestFormReset
    D(href: string): void; // prefetchDNS
    C(href: string, crossOrigin?: CrossOriginEnum): void; // preconnect
    L(href: string, as: string, options?: PreloadImplOptions): void; // preload
    m(href: string, options?: PreloadModuleImplOptions): void; // preloadModule
    S(href: string, precedence: string, options?: PreinitStyleOptions): void; // preinitStyle
    X(src: string, options?: PreinitScriptOptions): void; // preinitScript
    M(src: string, options?: PreinitModuleScriptOptions): void; // preinitModuleScript
}

export interface ReactDOMInternals {
    d: HostDispatcher; // ReactDOMCurrentDispatcher
    p: EventPriority; // currrentUpdatePriority
    findDOMNode?(componentOrElement: React.Component<any, any>): null | Element | Text;
}

export const ReactDOMInternals: ReactDOMInternals = (ReactDOM as any)?.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
