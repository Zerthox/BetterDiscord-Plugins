import * as Logger from "./logger";
import { getMeta } from "../meta";

/** Patcher options. */
export interface Options {
    /** Execute the patch once, then unpatch. */
    once?: boolean;

    /** Disable console output when patching. */
    silent?: boolean;

    /** Force patch creation when target is not function. */
    force?: boolean;

    /** Name of the patch target displayed in console output. */
    name?: string;
}

export type Cancel = () => void;

type Args<T> = T extends (...args: any) => any ? Parameters<T> : IArguments;

type Return<T> = T extends (...args: any) => any ? ReturnType<T> : any;

type This<T, P> =
    ThisParameterType<T> extends unknown ? (P extends React.Component<any, any> ? P : any) : ThisParameterType<T>;

export interface PatchData<Original, Parent = any> {
    cancel: Cancel;
    original: Original;
    context: This<Original, Parent>;
    args: Args<Original>;
}

export interface PatchDataWithResult<Original, Parent = any> extends PatchData<Original, Parent> {
    result: Return<Original>;
}

interface PatchDataWithOptResult<Original, Parent = any> extends PatchData<Original, Parent> {
    result?: Return<Original>;
}

/** Storage for manual patches. */
let manualPatches: Cancel[] = [];

/** Adds a manual patch. */
export const addManual = (cancel: Cancel, name?: string): void => {
    manualPatches.push(cancel);
    if (name) {
        Logger.log(`Patched ${name}`);
    }
};

const patch = <Object, Key extends keyof Object>(
    type: "before" | "after" | "instead",
    object: Object,
    method: Key,
    callback: (data: PatchDataWithOptResult<Object[Key], Object>) => unknown,
    options: Options,
) => {
    const original = object?.[method];
    const name = options.name ?? String(method);
    if (!(original instanceof Function)) {
        if (options.force && !original) {
            Logger.warn(`Forcing patch on ${name}`);
            object[method] = function noop() {} as any;
            addManual(() => {
                object[method] = original;
            });
        } else {
            throw TypeError(`patch target ${name} is ${original} not function`);
        }
    }

    const cancel = BdApi.Patcher[type](
        getMeta().name,
        object,
        method,
        options.once
            ? (context: any, args: any, result?: any) => {
                  const newResult = callback({ cancel, original, context, args, result });
                  cancel();
                  return newResult;
              }
            : (context: any, args: any, result?: any) => callback({ cancel, original, context, args, result }),
    );

    if (!options.silent) {
        Logger.log(`Patched ${name}`);
    }

    return cancel;
};

/** Patches the method, executing a callback **instead** of the original. */
export const instead = <Object, Key extends keyof Object>(
    object: Object,
    method: Key,
    callback: (data: PatchData<Object[Key], Object>) => unknown,
    options: Options = {},
): Cancel => patch("instead", object, method, callback, options);

/**
 * Patches the method, executing a callback **before** the original.
 *
 * Typically used to modify arguments passed to the original.
 */
export const before = <Object, Key extends keyof Object>(
    object: Object,
    method: Key,
    callback: (data: PatchData<Object[Key], Object>) => unknown,
    options: Options = {},
): Cancel => patch("before", object, method, callback, options);

/**
 * Patches the method, executing a callback **after** the original.
 *
 * Typically used to modify the return value of the original.
 *
 * Has access to the original method's return value via `result`.
 */
export const after = <Object, Key extends keyof Object>(
    object: Object,
    method: Key,
    callback: (data: PatchDataWithResult<Object[Key], Object>) => unknown,
    options: Options = {},
): Cancel => patch("after", object, method, callback, options);

/** Patches a context menu using its "navId". */
export const contextMenu = (
    navId: string,
    callback: (result: React.JSX.Element) => React.JSX.Element | void,
    options: Options = {},
): Cancel => {
    const cancel = BdApi.ContextMenu.patch(
        navId,
        options.once
            ? (tree) => {
                  const result = callback(tree);
                  cancel();
                  return result;
              }
            : callback,
    );
    manualPatches.push(cancel);

    if (!options.silent) {
        Logger.log(`Patched ${options.name ?? `"${navId}"`} context menu`);
    }

    return cancel;
};

/** Reverts all patches done by this patcher. */
export const unpatchAll = (): void => {
    if (manualPatches.length + BdApi.Patcher.getPatchesByCaller(getMeta().name).length > 0) {
        BdApi.Patcher.unpatchAll(getMeta().name);
        for (const cancel of manualPatches) {
            cancel();
        }
        manualPatches = [];
        Logger.log("Unpatched all");
    }
};
