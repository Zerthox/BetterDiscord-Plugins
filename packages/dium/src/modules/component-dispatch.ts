import {Filters, Finder} from "../api";

export interface ComponentDispatch {
    emitter: NodeJS.EventEmitter;

    dispatch(type: string, payload: any): any;
    dispatchKeyed(type: string, payload: any): any;
    dispatchToLastSubscribed(type: string, payload: any): any;
    safeDispatch(arg: any): any;

    hasSubscribers(type: string): any;
    subscribe(e: any, t: any): any;
    subscribeKeyed(e: any, t: any, n: any): any;
    subscribeOnce(e: any, t: any): any;
    resubscribe(e: any, t: any): any;
    unsubscribe(e: any, t: any): any;
    unsubscribeKeyed(e: any, t: any, n: any): any;

    reset(): any;
    _checkSavedDispatches(e: any): any;
}

export interface ComponentDispatcher {
    new(): ComponentDispatch;
}

interface ComponentDispatchModule {
    ComponentDispatch: ComponentDispatch;
    ComponentDispatcher: ComponentDispatcher;
}

export const {ComponentDispatch, ComponentDispatcher}: ComponentDispatchModule = /* @__PURE__ */ Finder.demangle({
    ComponentDispatch: Filters.byKeys("dispatchToLastSubscribed"),
    ComponentDispatcher: Filters.byProtos("dispatchToLastSubscribed")
});
