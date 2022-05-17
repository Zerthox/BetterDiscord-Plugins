import {React, ReactDOM} from "../modules";
import type {Fiber, ReactContext} from "react-reconciler";

export type {Fiber} from "react-reconciler";

export type BasicStateAction<S> = ((prevState: S) => S) | S;

export interface MutableSource<Source> {
    _source: Source;
    _getVersion: (source: Source) => any;
    _workInProgressVersionPrimary?: any;
    _workInProgressVersionSecondary?: any;
}

export interface Dispatcher {
    readContext<T>(context: ReactContext<T>, observedBits?: number | boolean): T;

    useState: typeof React.useState;
    useReducer: typeof React.useReducer;
    useContext: typeof React.useContext;
    useRef: typeof React.useRef;
    useEffect: typeof React.useEffect;
    useLayoutEffect: typeof React.useLayoutEffect;
    useCallback: typeof React.useCallback;
    useMemo: typeof React.useMemo;
    useImperativeHandle: typeof React.useImperativeHandle;
    useDebugValue: typeof React.useDebugValue;

    useDeferredValue<T>(value: T): T;
    useTransition(): [(f: () => void) => void, boolean];
    useMutableSource<Source, Snapshot>(
        source: MutableSource<Source>,
        getSnapshot: (source: Source) => Snapshot,
        subscribe: (source: Source, callback: (snapshot: Snapshot) => void) => (() => void)
    ): Snapshot;
    useOpaqueIdentifier(): any;

    unstable_isNewReconciler?: boolean;
}

export interface ReactInternals {
    IsSomeRendererActing: React.MutableRefObject<boolean>;
    ReactCurrentDispatcher: React.MutableRefObject<Dispatcher>;
    ReactCurrentBatchConfig: {transition: number};
    ReactCurrentOwner: React.MutableRefObject<Fiber | null>;
    assign: typeof Object.assign;
}

export const ReactInternals: ReactInternals = (React as any)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

export interface ReactDOMInternals {
    getInstanceFromNode(node: Node): Fiber;
    getNodeFromInstance(inst: Fiber): Node;
    getFiberCurrentPropsFromNode(node: Node): Record<string, any>;
    enqueueStateRestore(target: Node): void;
    restoreStateIfNeeded(): void;
    batchedUpdates<A, B, R>(fn: (a: A, b: B) => R, a: A, b: B): R;
}

const [
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
] = (ReactDOM as any)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];

export const ReactDOMInternals: ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
} as any;
