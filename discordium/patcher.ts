import {React} from "./modules";
import {Logger} from ".";

export interface Options {
    silent?: boolean;
    once?: boolean;
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

    const forward = (patcher, object, method, callback, options) => {
        const original = object[method];
        patcher(
            id,
            object,
            method,
            (context, args, result) => callback({context, args, original, result}),
            {silent: true, once: options.once}
        );
        if (!options.silent) {
            const target = object[method];
            const name = options.name || target.displayName || target.name || target.constructor.displayName || target.constructor.name || "unknown";
            const type = options.type || (target instanceof React.Component ? "component" : "module");
            Logger.log(`Patched ${method} of ${name} ${type}`);
        }
        return callback;
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
