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
    Settings
} from "./api";
import {React} from "./modules";
import {SettingsContainer} from "./components";

export {Finder, type Discord, ReactInternals, ReactDOMInternals} from "./api";
export * as Utils from "./utils";
export {React, ReactDOM, Flux} from "./modules";
export {version} from "../package.json";

export {Logger, Patcher, Styles, Data, Settings} from "./api";

export interface Api<
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType}
> {
    Logger: Logger;
    Patcher: Patcher;
    Styles: Styles;
    Data: Data<DataType>;
    Settings: Settings<SettingsType, DataType>;
}

export interface Config<Settings extends Record<string, any>> {
    name: string;
    version: string;
    author: string;
    description?: string;
    styles?: string;
    settings?: Settings;
}

export interface Plugin<> {
    /** Called on plugin start. */
    start(): void | Promise<void>;

    /**
     * Called on plugin stop.
     *
     * Be cautious when  doing async work here.
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
    {name, version, styles, settings}: Config<SettingsType>,
    callback: (api: Api<SettingsType, DataType>) => Plugin
): BdApi.PluginConstructor => {
    // create log
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData<DataType>(name);
    const Settings = createSettings(Data, settings ?? {} as SettingsType);

    // get plugin info
    const plugin = callback({Logger, Patcher, Styles, Data, Settings});

    // construct wrapper
    class Wrapper implements BdApi.Plugin {
        start() {
            Logger.log("Enabled");
            Styles.inject(styles);
            plugin.start();
        }
        stop() {
            Patcher.unpatchAll();
            Styles.clear();
            plugin.stop();
            Logger.log("Disabled");
        }
        getSettingsPanel?: () => JSX.Element;
    }

    // add settings panel
    if (plugin.SettingsPanel) {
        Wrapper.prototype.getSettingsPanel = () => (
            <SettingsContainer name={name} onReset={() => Settings.reset()}>
                <plugin.SettingsPanel/>
            </SettingsContainer>
        );
    }

    return Wrapper;
};
