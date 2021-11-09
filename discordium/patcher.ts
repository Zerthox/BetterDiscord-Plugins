import {Logger} from "./logger";

export interface Options {
    silent?: boolean;
    once?: boolean;
    name?: string;
}

export type Cancel = () => void;

export interface Data<Original extends () => any> {
    cancel: Cancel;
    original: Original;
    context: any;
    args: Parameters<Original>;
    result?: ReturnType<Original>;
}

export type Callback<Original extends () => any> = (data: Data<Original>) => unknown;

export interface Patcher {
    instead<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    before<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    after<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    unpatchAll(): void;
}

export const createPatcher = (id: string, Logger: Logger): Patcher => {
    // we assume bd env for now

    type PatcherMethod<
        Module extends Record<Key, () => any>,
        Key extends keyof Module
    > = (
        id: string,
        object: Module,
        method: Key,
        callback: (context: any, args: any, result: any) => any,
        options: Record<string, any>
    ) => Cancel;

    const forward = <
        Module extends Record<Key, () => any>,
        Key extends keyof Module
    >(
        patcher: PatcherMethod<Module, Key>,
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options: Options
    ) => {
        const original = object[method];
        const cancel = patcher(
            id,
            object,
            method,
            (context, args, result) => {
                const temp = callback({cancel, original, context, args, result});
                if (options.once) {
                    cancel();
                }
                return temp;
            },
            {silent: true}
        );
        if (!options.silent) {
            type Named = {displayName?: string; name?: string};
            const target = object[method] as Named & {constructor?: Named};
            const name = options.name ?? target.displayName ?? target.name ?? target.constructor.displayName ?? target.constructor.name ?? "unknown";
            Logger.log(`Patched ${method} of ${name}`);
        }
        return cancel;
    };

    const {Patcher} = BdApi;
    return {
        instead: (object, method, callback, options = {}) => forward(
            Patcher.instead,
            object,
            method,
            ({result: _, ...data}) => callback(data),
            options
        ),
        before: (object, method, callback, options = {}) => forward(
            Patcher.before,
            object,
            method,
            ({result: _, ...data}) => callback(data),
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
