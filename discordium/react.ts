import {React, ReactDOM} from "./modules";
import {Fiber} from "react-reconciler";

export {Fiber} from "react-reconciler";

export interface ReactInternals {
    ReactCurrentDispatcher: any;
    ReactCurrentBatchConfig: any;
    ReactCurrentOwner: any;
    assign: any;
}

export const ReactInternals: ReactInternals = (React as any)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

const [
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
] = (ReactDOM as any)?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events;

export interface ReactDOMInternals {
    getInstancefromNode(node: Node): Fiber;
    getNodeFromInstance(inst: Fiber): Node;
    getFiberCurrentPropsFromNode(node: Node): Record<string, any>;
    enqueueStateRestore(target: Node): void;
    restoreStateIfNeeded(): void;
    batchedUpdates<A, B, R>(fn: (a: A, b: B) => R, a: A, b: B): R;
}

export const ReactDOMInternals: ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
} as any;
