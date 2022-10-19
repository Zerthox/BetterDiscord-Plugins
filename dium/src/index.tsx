import {Logger, Styles, Patcher, Lazy, SettingsStore} from "./api";
import {React} from "./modules";
import {SettingsContainer} from "./settings-container";
import type * as BD from "betterdiscord";
import type * as Webpack from "./require";

export * from "./api";
export {ReactInternals, ReactDOMInternals, Fiber} from "./react-internals";
export * as Utils from "./utils";
export {React, ReactDOM, Flux} from "./modules";
export {version} from "../package.json";
export type {Webpack};

export interface Config<T extends Record<string, any>> {
    /**
     * Plugin styles.
     *
     * Passed as CSS in string form.
     * Injected/removed when the plugin is started/stopped.
     */
    styles?: string;

    /** Initial plugin settings. */
    settings?: T | SettingsStore<T>;
}

export interface CallbackData<T extends Record<string, any>> {
    meta: BD.Meta;
    Settings: SettingsStore<T>;
}

export interface Plugin {
    /** Called on plugin start. */
    start(): void | Promise<void>;

    /**
     * Called on plugin stop.
     *
     * Be cautious when doing async work here.
     */
    stop(): void;

    /** Settings UI as React component. */
    SettingsPanel?: React.ComponentType;
}

/** Creates a BetterDiscord plugin. */
export const createPlugin = <T extends Record<string, any>>(
    {styles, settings}: Config<T>,
    callback: (data: CallbackData<T>) => Plugin
): BD.PluginCallback => (meta) => {
    // create settings store if necesary
    const Settings = settings instanceof SettingsStore ? settings : new SettingsStore(settings);

    // get plugin info
    const plugin = callback({meta, Settings});

    // construct plugin
    return {
        start() {
            Logger.log("Enabled");
            Styles.inject(styles);
            plugin.start();
        },
        stop() {
            Lazy.abort();
            Patcher.unpatchAll();
            Styles.clear();
            plugin.stop();
            Logger.log("Disabled");
        },
        getSettingsPanel: plugin.SettingsPanel ? () => (
            <SettingsContainer name={meta.name} onReset={() => Settings.reset()}>
                <plugin.SettingsPanel/>
            </SettingsContainer>
        ) : null
    };
};
