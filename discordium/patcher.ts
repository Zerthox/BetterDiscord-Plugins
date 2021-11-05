import {React} from "./modules";
import {Logger} from ".";

export interface Options {
    silent?: boolean;
    once?: boolean;
    name?: string;
    type?: string;
}

export interface Data<Original extends () => any> {
    context: any;
    args: any[];
    original: Original;
    result?: ReturnType<Original>;
}

export type Callback<Original extends () => any> = (data: Data<Original>) => unknown;

export type Cancel = () => void;

export interface Patcher {
    instead<O extends Record<K, () => any>, K extends keyof O>(
        object: O,
        method: K,
        callback: Callback<O[K]>,
        options?: Options
    ): Cancel;
    before<O extends Record<K, () => any>, K extends keyof O>(
        object: O,
        method: K,
        callback: Callback<O[K]>,
        options?: Options
    ): Cancel;
    after<O extends Record<K, () => any>, K extends keyof O>(
        object: O,
        method: K,
        callback: Callback<O[K]>,
        options?: Options
    ): Cancel;
    unpatchAll(): void;
}

export const createPatcher = (id: string, Logger: Logger): Patcher => {
    // we assume bd env for now

    type PatcherMethod<O extends Record<K, () => any>, K extends keyof O> = (
        id: string,
        object: O,
        method: K,
        callback: (context: any, args: any, result: any) => any,
        options: Record<string, any>
    ) => Cancel;

    const forward = <O extends Record<K, () => any>, K extends keyof O>(
        patcher: PatcherMethod<O, K>,
        object: O,
        method: K,
        callback: Callback<O[K]>,
        options: Options
    ) => {
        const original = object[method];
        const cancel = patcher(
            id,
            object,
            method,
            (context, args, result) => callback({context, args, original, result}),
            {silent: true, once: options.once}
        );
        if (!options.silent) {
            type Named = {displayName?: string, name?: string};
            const target = object[method] as Named & {constructor?: Named};
            const name = options.name ?? target.displayName ?? target.name ?? target.constructor.displayName ?? target.constructor.name ?? "unknown";
            const type = options.type ?? (target instanceof React.Component ? "component" : "module");
            Logger.log(`Patched ${method} of ${name} ${type}`);
        }
        return cancel;
    };

    const {Patcher} = BdApi;
    return {
        instead: (object, method, callback, options = {}) => forward(
            Patcher.instead,
            object,
            method,
            ({context, args, original}) => callback({context, args, original}),
            options
        ),
        before: (object, method, callback, options = {}) => forward(
            Patcher.before,
            object,
            method,
            ({context, args, original}) => callback({context, args, original}),
            options
        ),
        after: (object, method, callback, options = {}) => forward(
            Patcher.after,
            object,
            method,
            callback,
            options
        ),
        unpatchAll: () => Patcher.unpatchAll(id)
    };
};
