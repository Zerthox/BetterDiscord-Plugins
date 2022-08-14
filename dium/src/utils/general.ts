import type * as BD from "betterdiscord";

export const sleep = (duration: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, duration));

export const alert = (title: string, content: string | JSX.Element): void => BdApi.alert(title, content);

export type ConfirmOptions = BD.ConfirmationModalOptions;

/** Shows a confirmation modal. */
// TODO: change to promise<boolean>?
export const confirm = (title: string, content: string | JSX.Element, options: ConfirmOptions = {}): void => BdApi.showConfirmationModal(title, content, options);

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
export const toast = (content: string, options: ToastOptions): void => BdApi.showToast(content, options);
