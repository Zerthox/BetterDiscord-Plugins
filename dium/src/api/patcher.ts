import {Logger} from "./logger";
import type * as BD from "betterdiscord";

export interface Options {
    silent?: boolean;
    once?: boolean;
    name?: string;
}

export type Cancel = () => void;

export interface Data<Original> {
    cancel: Cancel;
    original: Original;
    context: ThisParameterType<Original> extends unknown ? any : ThisParameterType<Original>;
    args: Original extends (...args: any) => any ? Parameters<Original> : IArguments;
}

export interface DataWithResult<Original> extends Data<Original> {
    result: Original extends (...args: any) => any ? ReturnType<Original> : any;
}

export interface Patcher {
    /** Patches the method, executing a callback **instead** of the original. */
    instead<Module, Key extends keyof Module>(
        object: Module,
        method: Key,
        callback: (data: Data<Module[Key]>) => unknown,
        options?: Options
    ): Cancel;

    /**
     * Patches the method, executing a callback **before** the original.
     *
     * Typically used to modify arguments passed to the original.
     */
    before<Module, Key extends keyof Module>(
        object: Module,
        method: Key,
        callback: (data: Data<Module[Key]>) => unknown,
        options?: Options
    ): Cancel;

    /**
     * Patches the method, executing a callback **after** the original.
     *
     * Typically used to modify the return value of the original.
     *
     * Has access to the original method's return value via `result`.
     */
    after<Module, Key extends keyof Module>(
        object: Module,
        method: Key,
        callback: (data: DataWithResult<Module[Key]>) => unknown,
        options?: Options
    ): Cancel;

    /** Reverts all patches done by this patcher. */
    unpatchAll(): void;
}

const resolveName = <Module, Key extends keyof Module>(object: Module, method: Key) => {
    const target: any = method === "default" ? object[method] : {};
    return (object as any).displayName ?? (object as any).constructor?.displayName ?? target.displayName ?? "unknown";
};

export const createPatcher = (id: string, Logger: Logger): Patcher => {
    const forward = <Module, Key extends keyof Module>(
        patch: BD.Patcher["before" | "after" | "instead"],
        object: Module,
        method: Key,
        callback: (cancel: Cancel, original: Module[Key], ...args: any) => any,
        options: Options
    ) => {
        const original = object?.[method];
        if (typeof original !== "function") {
            throw TypeError(`patch target ${original} is not a function`);
        }
        const cancel = patch(
            id,
            object,
            method,
            options.once ? (...args: any) => {
                const result = callback(cancel, original, ...args);
                cancel();
                return result;
            } : (...args: any) => callback(cancel, original, ...args)
        );
        if (!options.silent) {
            Logger.log(`Patched ${String(method)} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };

    return {
        instead: (object, method, callback, options = {}) => forward(
            BdApi.Patcher.instead,
            object,
            method,
            (cancel, original, context, args) => callback({cancel, original, context, args}),
            options
        ),
        before: (object, method, callback, options = {}) => forward(
            BdApi.Patcher.before,
            object,
            method,
            (cancel, original, context, args) => callback({cancel, original, context, args}),
            options
        ),
        after: (object, method, callback, options = {}) => forward(
            BdApi.Patcher.after,
            object,
            method,
            (cancel, original, context, args, result) => callback({cancel, original, context, args, result}),
            options
        ),
        unpatchAll: () => {
            if (BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};
