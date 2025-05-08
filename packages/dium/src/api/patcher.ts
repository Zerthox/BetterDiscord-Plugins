import * as Logger from "./logger";
import {getMeta} from "../meta";

/** Patcher options. */
export interface Options {
    /** Execute the patch once, then unpatch. */
    once?: boolean;

    /** Disable console output when patching. */
    silent?: boolean;

    /** Name of the patch target displayed in console output. */
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

const patch = <Module, Key extends keyof Module>(
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

    const cancel = BdApi.Patcher[type](
        getMeta().name,
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

/** Patches the method, executing a callback **instead** of the original. */
export const instead = <Module, Key extends keyof Module>(
    object: Module,
    method: Key,
    callback: (data: PatchData<Module[Key], Module>) => unknown,
    options: Options = {}
): Cancel => patch(
    "instead",
    object,
    method,
    (cancel, original, context, args) => callback({cancel, original, context, args}),
    options
);

/**
 * Patches the method, executing a callback **before** the original.
 *
 * Typically used to modify arguments passed to the original.
 */
export const before = <Module, Key extends keyof Module>(
    object: Module,
    method: Key,
    callback: (data: PatchData<Module[Key], Module>) => unknown,
    options: Options = {}
): Cancel => patch(
    "before",
    object,
    method,
    (cancel, original, context, args) => callback({cancel, original, context, args}),
    options
);

/**
 * Patches the method, executing a callback **after** the original.
 *
 * Typically used to modify the return value of the original.
 *
 * Has access to the original method's return value via `result`.
 */
export const after = <Module, Key extends keyof Module>(
    object: Module,
    method: Key,
    callback: (data: PatchDataWithResult<Module[Key], Module>) => unknown,
    options: Options = {}
): Cancel => patch(
    "after",
    object,
    method,
    (cancel, original, context, args, result) => callback({cancel, original, context, args, result}),
    options
);

/** Storage for context menu patches. */
let menuPatches: Cancel[] = [];

/** Patches a context menu using its "navId". */
export const contextMenu = (
    navId: string,
    callback: (result: React.JSX.Element) => React.JSX.Element | void,
    options: Options = {}
): Cancel => {
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
};

/** Reverts all patches done by this patcher. */
export const unpatchAll = (): void => {
    if (menuPatches.length + BdApi.Patcher.getPatchesByCaller(getMeta().name).length > 0) {
        for (const cancel of menuPatches) {
            cancel();
        }
        menuPatches = [];
        BdApi.Patcher.unpatchAll(getMeta().name);
        Logger.log("Unpatched all");
    }
};
