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
    /** Patches the method, executing a callback **instead** of the original. */
    instead<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    /**
     * Patches the method, executing a callback **before** the original.
     *
     * Typically used to modify arguments passed to the original.
     */
    before<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    /**
     * Patches the method, executing a callback **after** the original.
     *
     * Typically used to modify the return value of the original.
     *
     * Has access to the original method's return value via `result`.
     */
    after<
        Module extends Record<Key, (...args: any[]) => any>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        callback: Callback<Module[Key]>,
        options?: Options
    ): Cancel;

    /** Reverts all patches done by this patcher. */
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
            options.once ? (context, args, result) => {
                const temp = callback({cancel, original, context, args, result});
                cancel();
                return temp;
            } : (context, args, result) => callback({cancel, original, context, args, result}),
            {silent: true}
        );
        if (!options.silent) {
            const target: any = method === "default" ? object[method] : {};
            const name = options.name ?? (object as any).displayName ?? (object as any).constructor?.displayName ?? target.displayName ?? "unknown";
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
        unpatchAll: () => {
            Patcher.unpatchAll(id);
            Logger.log("Unpatched all");
        }
    };
};
