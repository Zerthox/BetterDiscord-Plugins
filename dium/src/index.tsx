import {
    createLogger,
    Logger,
    createPatcher,
    Patcher,
    createStyles,
    Styles,
    createData,
    Data,
    createSettings,
    Settings,
    Lazy,
    createLazy
} from "./api";
import {React} from "./modules";
import {SettingsContainer} from "./settings-container";
import type * as BD from "betterdiscord";
import type * as Webpack from "./require";

export * as Filters from "./filters";
export * as Finder from "./finder";
export {ReactInternals, ReactDOMInternals, Fiber} from "./react-internals";
export * as Utils from "./utils";
export {React, ReactDOM, Flux} from "./modules";
export {version} from "../package.json";

export type {Logger, Lazy, Patcher, PatchData, PatchDataWithResult, Styles, Data, Settings} from "./api";
export type {Webpack};

export interface Api<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> {
    /** Meta information about the plugin. */
    meta: BD.Meta;

    /** Logger to output formatted messages to the console. */
    Logger: Logger;

    /** Helper for lazy loaded modules. */
    Lazy: Lazy;

    /** Helper for modifying function behavior. */
    Patcher: Patcher;

    /**
     * Plugin styles.
     *
     * Usually not accessed manually.
     */
    Styles: Styles;

    /**
     * Plugin data storage.
     *
     * Usually not accessed manually.
     */
    Data: Data<DataType>;

    /**
     * Plugin settings.
     *
     * This is a Flux store.
     */
    Settings: Settings<SettingsType, DataType>;
}

export interface Config<Settings extends Record<string, any>> {
    /** Plugin name. */
    name?: string;

    /** Plugin version. */
    version?: string;

    /**
     * Plugin styles.
     *
     * Passed as CSS in string form.
     * Injected/removed when the plugin is started/stopped.
     */
    styles?: string;

    /** Initial plugin settings. */
    settings?: Settings;
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
export const createPlugin = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType} = {settings: SettingsType}
>(
    config: Config<SettingsType>,
    callback: (api: Api<SettingsType, DataType>) => Plugin
): BD.PluginCallback => (meta) => {
    const name = config.name ?? meta.name;
    const version = config.version ?? meta.version;

    // create api
    const Logger = createLogger(name, "#3a71c1", version);
    const Lazy = createLazy();
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData<DataType>(name);
    const Settings = createSettings(Data, config.settings ?? {} as SettingsType);

    // get plugin info
    const plugin = callback({meta, Logger, Lazy, Patcher, Styles, Data, Settings});

    // construct plugin
    return {
        start() {
            Logger.log("Enabled");
            Styles.inject(config.styles);
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
            <SettingsContainer name={name} onReset={() => Settings.reset()}>
                <plugin.SettingsPanel/>
            </SettingsContainer>
        ) : null
    };
};
