import {Logger} from "./logger";
import type * as BD from "betterdiscord";

export interface Options {
    silent?: boolean;
    once?: boolean;
    name?: string;
}

export type Cancel = () => void;

type Args<T> = T extends (...args: any) => any ? Parameters<T> : IArguments;

type Return<T> = T extends (...args: any) => any ? ReturnType<T> : any;

type This<T, P> = ThisParameterType<T> extends unknown ? (
    P extends React.Component<any, any> ? P : any
) : ThisParameterType<T>;

export interface PatchData<Original, Parent = any> {
    cancel: Cancel;
    original: Original;
    context: This<Original, Parent>;
    args: Args<Original>;
}

export interface PatchDataWithResult<Original, Parent = any> extends PatchData<Original, Parent> {
    result: Return<Original>;
}

export interface Patcher {
    /** Patches the method, executing a callback **instead** of the original. */
    instead<Module, Key extends keyof Module>(
        object: Module,
        method: Key,
        callback: (data: PatchData<Module[Key], Module>) => unknown,
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
        callback: (data: PatchData<Module[Key], Module>) => unknown,
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
        callback: (data: PatchDataWithResult<Module[Key], Module>) => unknown,
        options?: Options
    ): Cancel;

    /** Patches a context menu using its "navId". */
    contextMenu(
        navId: string,
        callback: (result: JSX.Element) => JSX.Element | void,
        options?: Options
    ): Cancel;

    /** Reverts all patches done by this patcher. */
    unpatchAll(): void;
}

export const createPatcher = (id: string, Logger: Logger): Patcher => {
    const forward = <Module, Key extends keyof Module>(
        patcher: BD.Patcher,
        type: "before" | "after" | "instead",
        object: Module,
        method: Key,
        callback: (cancel: Cancel, original: Module[Key], ...args: any) => any,
        options: Options
    ) => {
        const original = object?.[method];
        if (!(original instanceof Function)) {
            throw TypeError(`patch target ${original} is not a function`);
        }

        const cancel = patcher[type](
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
            Logger.log(`Patched ${options.name ?? String(method)}`);
        }

        return cancel;
    };

    let menuPatches: Cancel[] = [];

    return {
        instead: (object, method, callback, options = {}) => forward(
            BdApi.Patcher,
            "instead",
            object,
            method,
            (cancel, original, context, args) => callback({cancel, original, context, args}),
            options
        ),
        before: (object, method, callback, options = {}) => forward(
            BdApi.Patcher,
            "before",
            object,
            method,
            (cancel, original, context, args) => callback({cancel, original, context, args}),
            options
        ),
        after: (object, method, callback, options = {}) => forward(
            BdApi.Patcher,
            "after",
            object,
            method,
            (cancel, original, context, args, result) => callback({cancel, original, context, args, result}),
            options
        ),
        contextMenu(navId, callback, options = {}) {
            const cancel = BdApi.ContextMenu.patch(navId, options.once ? (tree) => {
                const result = callback(tree);
                cancel();
                return result;
            } : callback);
            menuPatches.push(cancel);

            if (!options.silent) {
                Logger.log(`Patched ${options.name ?? `"${navId}"`} context menu`);
            }

            return cancel;
        },
        unpatchAll() {
            if (menuPatches.length + BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                for (const cancel of menuPatches) {
                    cancel();
                }
                menuPatches = [];
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};
