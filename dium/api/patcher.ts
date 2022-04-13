import {Logger} from "./logger";
import Modules from "../modules";

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

    /**
     * Patches the lazy load method, executing a callback every time it loads something.
     *
     * The patch is cancelled automatically once the callback returns something.
     */
    waitForLazy<
        T,
        Module extends Record<Key, (...args: any[]) => Promise<any>>,
        Key extends keyof Module
    >(
        object: Module,
        method: Key,
        argIndex: number,
        callback: () => T
    ): Promise<T>;

    /**
     * Listen for context menu related lazy loads.
     *
     * The patch is cancelled automatically once the callback returns something.
     */
    waitForContextMenu<T>(callback: () => T): Promise<T>;

    /**
     * Listen for modal related lazy loads.
     *
     * The patch is cancelled automatically once the callback returns something.
     */
    waitForModal<T>(callback: () => T): Promise<T>;
}

const resolveName = <Module, Key extends keyof Module>(object: Module, method: Key) => {
    const target: any = method === "default" ? object[method] : {};
    return (object as any).displayName ?? (object as any).constructor?.displayName ?? target.displayName ?? "unknown";
};

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
            Logger.log(`Patched ${method} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };

    const rawPatcher = BdApi.Patcher;

    const patcher: Patcher = {
        instead: (object, method, callback, options = {}) => forward(
            rawPatcher.instead,
            object,
            method,
            ({result: _, ...data}) => callback(data),
            options
        ),
        before: (object, method, callback, options = {}) => forward(
            rawPatcher.before,
            object,
            method,
            ({result: _, ...data}) => callback(data),
            options
        ),
        after: (object, method, callback, options = {}) => forward(
            rawPatcher.after,
            object,
            method,
            callback,
            options
        ),
        unpatchAll: () => {
            rawPatcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        waitForLazy: (object, method, argIndex, callback) => new Promise<any>((resolve) => {
            // check load once before we patch
            const found = callback();
            if (found) {
                resolve(found);
            } else {
                // patch lazy load method
                Logger.log(`Waiting for lazy load in ${method} of ${resolveName(object, method)}`);
                patcher.before(object, method, ({args, cancel}) => {
                    // replace resolver function
                    const original = args[argIndex] as (...args: any[]) => Promise<any>;
                    args[argIndex] = async function(...args: any[]) {
                        const result = await original.call(this, ...args);

                        // async check if loaded
                        Promise.resolve().then(() => {
                            const found = callback();
                            if (found) {
                                resolve(found);

                                // we dont need the patch anymore
                                cancel();
                            }
                        });

                        return result;
                    };
                }, {silent: true});
            }
        }),
        waitForContextMenu: (callback) => patcher.waitForLazy(Modules.ContextMenuActions, "openContextMenuLazy", 1, callback),
        waitForModal: (callback) => patcher.waitForLazy(Modules.ModalActions, "openModalLazy", 0, callback)
    };

    return patcher;
};
