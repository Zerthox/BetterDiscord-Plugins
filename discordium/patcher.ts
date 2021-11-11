import {Logger} from "./logger";
import {findOwner} from "./utils";
import {Fiber} from "./react";

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

    forceRerender(fiber: Fiber): Promise<boolean>;
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
            const target: any = method === "default" ? object[method] : {};
            const name = options.name ?? (object as any).displayName ?? (object as any).constructor?.displayName ?? target.displayName ?? "unknown";
            Logger.log(`Patched ${method} of ${name}`);
        }
        return cancel;
    };

    const {Patcher} = BdApi;
    const instead: Patcher["instead"] = (object, method, callback, options = {}) => forward(
        Patcher.instead,
        object,
        method,
        ({result: _, ...data}) => callback(data),
        options
    );
    const before: Patcher["before"] = (object, method, callback, options = {}) => forward(
        Patcher.before,
        object,
        method,
        ({result: _, ...data}) => callback(data),
        options
    );
    const after: Patcher["after"] = (object, method, callback, options = {}) => forward(
        Patcher.after,
        object,
        method,
        callback,
        options
    );

    return {
        instead,
        before,
        after,
        unpatchAll: () => {
            Patcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        forceRerender: (fiber: Fiber) => new Promise((resolve) => {
            // find owner
            const owner = findOwner(fiber);
            if (owner) {
                // render no elements in next render
                const {stateNode} = owner;
                after(stateNode, "render", () => null, {once: true});

                // force update twice
                stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
            } else {
                resolve(false);
            }
        })
    };
};
