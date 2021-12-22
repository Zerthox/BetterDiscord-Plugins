export interface Event extends Record<string, any> {
    type: string;
}

export type Listener = (event: Event) => void;

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

    subscribe<E extends Event>(event: E["type"], listener: Listener): void;
    unsubscribe<E extends Event>(event: E["type"], listener: Listener): void;

    wait<T>(callback: () => T): T | void;
}

export interface Module {
    default: Dispatcher;
    Dispatcher: typeof Dispatcher;
}
