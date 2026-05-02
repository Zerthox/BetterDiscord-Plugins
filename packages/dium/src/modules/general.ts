import { Finder } from "../api";
import type { IntlManager } from "@discord/intl";

/** A timestamped ID stored as a string. */
export type Snowflake = string;

export type ActionModule = Record<string, (...args: any) => any>;

export const intl: typeof import("@discord/intl") = /* @__PURE__ */ Finder.byKeys(["IntlManager", "FormatBuilder"]);

export interface LocaleModule {
    international: any;
    initialLocale: string;
    intl: IntlManager;
    getSystemLocale(): any;
    useSyncMessages(): any;
    t: any;
    getLanguages(): any;
    getAvailableLocales(): any;
    systemLocal(): any;
}

export const locale: LocaleModule = /* @__PURE__ */ Finder.byKeys(["intl", "getSystemLocale"]);
