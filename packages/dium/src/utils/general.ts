import type * as BD from "betterdiscord";

export const hasOwnProperty = (object: unknown, property: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(object, property);

export const sleep = (duration: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, duration));

export const alert = (title: string, content: string | JSX.Element): void => BdApi.UI.alert(title, content);

export type ConfirmOptions = BD.ConfirmationModalOptions;

/** Shows a confirmation modal. */
// TODO: change to promise<boolean>?
export const confirm = (title: string, content: string | JSX.Element, options: ConfirmOptions = {}): string => BdApi.UI.showConfirmationModal(title, content, options);

export const enum ToastType {
    Default = "",
    Info = "info",
    Success = "success",
    Warn = "warn",
    Warning = "warning",
    Danger = "danger",
    Error = "error"
}

export interface ToastOptions extends BD.ToastOptions {
    type?: ToastType;
}

/** Shows a toast notification. */
export const toast = (content: string, options: ToastOptions): void => BdApi.UI.showToast(content, options);

export type MappedProxy<
    T extends Record<any, any>,
    M extends Record<any, keyof T>
> = {
    [K in keyof M | keyof T]: T[M[K] extends never ? K : M[K]];
};

/** Creates a proxy mapping additional properties to other properties on the original. */
export const mappedProxy = <
    T extends Record<any, any>,
    M extends Record<any, keyof T>
>(target: T, mapping: M): MappedProxy<T, M> => {
    const map = new Map(Object.entries(mapping));
    return new Proxy(target, {
        get(target, prop) {
            return target[map.get(prop as any) ?? prop];
        },
        set(target, prop, value) {
            target[map.get(prop as any) ?? prop] = value;
            return true;
        },
        deleteProperty(target, prop) {
            delete target[map.get(prop as any) ?? prop];
            map.delete(prop as any);
            return true;
        },
        has(target, prop) {
            return map.has(prop as any) || prop in target;
        },
        ownKeys() {
            return [...map.keys(), ...Object.keys(target)];
        },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(target, map.get(prop as any) ?? prop);
        },
        defineProperty(target, prop, attributes) {
            Object.defineProperty(target, map.get(prop as any) ?? prop, attributes);
            return true;
        }
    }) as any;
};
