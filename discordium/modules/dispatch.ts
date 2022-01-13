import * as Finder from "../api/finder";

export interface Event extends Record<string, any> {
    type: string;
}

export type Listener<E extends Event> = (event: E) => void;

export type Token = string;

export declare class Dispatcher {
    constructor();

    dispatch<E extends Event>(event: E): void;
    dirtyDispatch<E extends Event>(event: E): void;
    maybeDispatch<E extends Event>(event: E): any;
    isDispatching(): boolean;

    register(name: any, actionHandler: any, storeDidChange: any): Token;
    addDependencies(arg1: any, arg2: any): void;
    setInterceptor(interceptor: any): void;

    subscribe<E extends Event>(event: E["type"], listener: Listener<E>): void;
    unsubscribe<E extends Event>(event: E["type"], listener: Listener<E>): void;

    wait<T>(callback: () => T): T | void;
}

export interface Module {
    default: Dispatcher;
    Dispatcher: typeof Dispatcher;
}

export const Dispatch: Module = Finder.query({props: ["default", "Dispatcher"], filter: (exports) => exports instanceof Object && !("ActionBase" in exports)});

export const Events: Dispatcher = Dispatch?.default;
