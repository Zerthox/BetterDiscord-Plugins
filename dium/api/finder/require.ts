export type WebpackId = number;

export type Exports = Record<string, any>;

export interface Module {
    id: WebpackId;
    loaded: boolean;
    exports: Exports;
}

export type ModuleFunction = (this: Exports, module: Module, exports: Exports, require: Require) => void;

export interface Require {
    (id: WebpackId): any;

    /** Modules object. */
    m: Record<string, ModuleFunction>;

    /** Module cache. */
    c: Record<string, Module>;

    /** Module execution interceptor. */
    i: any[];

    /** Chunk loaded. */
    O(result: any, chunkIds: any, fn: any, priority: any): any;

    /** Get default export. */
    n(module: any): any;

    /** Create fake namespace object. */
    t(value: any, mode: any): any;

    /** Define property getters. */
    d(exports: any, definition: any): any;

    /** Ensure chunk. */
    e(chunkId: WebpackId): Promise<any>;

    /** Get chunk filename. */
    u(chunkId: WebpackId): any;

    /** Global. */
    g(): typeof globalThis;

    /** hasOwnProperty shorthand. */
    o(obj: any, prop: any): any;

    /** Load script. */
    l(url: any, done: any, key: any, chunkId: WebpackId): any;

    /** Make namespace object. */
    r(exports: any): any;

    /** Node module decorator. */
    nmd(module: any): any;

    /** publicPath. */
    p: string;
}
