import {React} from "./modules";
import {Config, Log} from ".";

export interface Options {
    silent?: boolean;
    once?: boolean;
}

export interface Data<Original> {
    context: unknown;
    args: unknown[];
    original: Original;
}

export type Callback<Original> = (data: Data<Original>) => unknown;

export type Cancel = () => void;

export interface Patcher {
    instead<R extends Record<string, unknown>, K extends keyof R>(
        object: R,
        method: K,
        options: Options,
        callback: Callback<R[K]>
    ): Cancel;
    before<R extends Record<string, unknown>, K extends keyof R>(
        object: R,
        method: K,
        options: Options,
        callback: Callback<R[K]>
    ): Cancel;
    after<R extends Record<string, unknown>, K extends keyof R>(
        object: R,
        method: K,
        options: Options,
        callback: Callback<R[K]>
    ): Cancel;
    unpatchAll(): void;
}

export const createPatcher = (config: Config, log: Log): Patcher => {
    // we assume bd env for now

    const forward = (patcher, object, method, options, callback) => {
        patcher(config.name, object, method, {silent: true, once: options.once}, callback);
        if (!options.silent) {
            const target = object[method];
            const name = options.name || target.displayName || target.name || target.constructor.displayName || target.constructor.name || "unknown";
            const type = options.type || (target instanceof React.Component ? "component" : "module");
            log.log(`Patched ${method} of ${name} ${type}`);
        }
        return callback;
    };

    const {Patcher} = BdApi;
    return {
        instead: (object, method, options, callback) => forward(Patcher.instead, object, method, options, callback),
        before: (object, method, options, callback) => forward(Patcher.before, object, method, options, callback),
        after: (object, method, options, callback) => forward(Patcher.after, object, method, options, callback),
        unpatchAll: () => Patcher.unpatchAll(config.name)
    };
};
