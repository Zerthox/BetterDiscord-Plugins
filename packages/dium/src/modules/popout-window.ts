import * as Finder from "../api/finder";
import type { Action, Store } from "./flux";

export type PopoutWindowKey = string;

export interface PopoutWindowState extends Record<string, any> {
    alwaysOnTop: boolean;
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface PopoutWindowAction extends Action {
    key: PopoutWindowKey;
    features: Record<string, any>;
    render: React.ReactElement;
}

export interface PopoutWindowStore extends Store {
    getState(): Record<PopoutWindowKey, PopoutWindowState>;
    getWindowKeys(): PopoutWindowKey[];

    getWindow(key: PopoutWindowKey): Window;
    getWindowState(key: PopoutWindowKey): PopoutWindowState;
    getWindowOpen(key: PopoutWindowKey): boolean;
    getWindowFocused(key: PopoutWindowKey): boolean;
    getIsAlwaysOnTop(key: PopoutWindowKey): boolean;

    unmountWindow(key: PopoutWindowKey): void;

    __getLocalVars(): any;
}

export const PopoutWindowStore: PopoutWindowStore = /* @__PURE__ */ Finder.byName("PopoutWindowStore");
