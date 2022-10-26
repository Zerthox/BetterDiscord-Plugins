import {Logger, Styles, Patcher, Lazy} from "./api";
import {SettingsStore} from "./settings";
import {React} from "./modules";
import {SettingsContainer} from "./settings-container";
import type * as BD from "betterdiscord";
import type * as Webpack from "./require";
import {setMeta} from "./meta";

export * from "./api";
export {createSettings, SettingsStore, SettingsType} from "./settings";
export {ReactInternals, ReactDOMInternals, Fiber} from "./react-internals";
export * as Utils from "./utils";
export {React, ReactDOM, Flux} from "./modules";
export {getMeta, setMeta, Meta} from "./meta";
export {version} from "../package.json";
export type {Webpack};

export interface BasePlugin {
    /** Called on plugin start. */
    start(): void | Promise<void>;

    /**
     * Called on plugin stop.
     *
     * Be cautious when doing async work here.
     */
    stop?(): void;

    /**
     * Plugin styles.
     *
     * Passed as CSS in string form.
     * Injected/removed when the plugin is started/stopped.
     */
    styles?: string;
}

export interface PluginWithoutSettings extends BasePlugin {
    Settings?: never;
    SettingsPanel?: never;
}

export interface PluginWithSettings<T extends Record<string, any>> extends BasePlugin {
    /** Plugin settings store. */
    Settings: SettingsStore<T>;

    /** Settings UI as React component. */
    SettingsPanel?: React.ComponentType;
}

export type Plugin<T extends Record<string, any>> = PluginWithoutSettings | PluginWithSettings<T>;

/** Creates a BetterDiscord plugin. */
export const createPlugin = <T extends Record<string, any>>(
    plugin: Plugin<T> | ((meta: BD.Meta) => Plugin<T>)
): BD.PluginCallback => (meta) => {
    // set meta
    setMeta(meta);

    // get plugin info
    const {start, stop, styles, Settings, SettingsPanel} = (plugin instanceof Function ? plugin(meta) : plugin) as PluginWithSettings<T>;
    if (Settings) {
        Settings.load();
    }

    // construct plugin
    return {
        start() {
            Logger.log("Enabled");
            Styles.inject(styles);
            start();
        },
        stop() {
            Lazy.abort();
            Patcher.unpatchAll();
            Styles.clear();
            stop?.();
            Logger.log("Disabled");
        },
        getSettingsPanel: SettingsPanel ? () => (
            <SettingsContainer name={meta.name} onReset={() => Settings.reset()}>
                <SettingsPanel/>
            </SettingsContainer>
        ) : null
    };
};
