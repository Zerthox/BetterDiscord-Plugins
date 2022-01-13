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
    SettingsProps
} from "./api";
import {React} from "./modules";
import {SettingsContainer} from "./components";

export {Finder, Discord, ReactInternals, ReactDOMInternals} from "./api";
export * as Utils from "./utils";
export * as Modules from "./modules";
export {React, ReactDOM, classNames, lodash, Flux} from "./modules";
export {version} from "../package.json";

export {Logger, Patcher, Styles, Data, Settings, SettingsProps} from "./api";

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

export interface Plugin<Settings extends Record<string, any>> {
    /** Called on plugin start. */
    start(): void | Promise<void>;

    /**
     * Called on plugin stop.
     *
     * Be cautious when  doing async work here.
     */
    stop(): void;

    /** Settings UI as React component. */
    settingsPanel?: React.ComponentType<SettingsProps<Settings>>;
}

/** Creates a BetterDiscord plugin. */
export const createPlugin = <
    SettingsType extends Record<string, any>,
    DataType extends {settings: SettingsType} = {settings: SettingsType}
>(
    {name, version, styles: css, settings}: Config<SettingsType>,
    callback: (api: Api<SettingsType, DataType>) => Plugin<SettingsType>
) => {
    // create log
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData<DataType>(name);
    const Settings = createSettings(Data, settings ?? {} as SettingsType);

    // get plugin info
    const plugin = callback({Logger, Patcher, Styles, Data, Settings});

    // construct wrapper
    function Wrapper() {}
    Wrapper.prototype.start = () => {
        Logger.log("Enabled");
        Styles.inject(css);
        plugin.start();
    };
    Wrapper.prototype.stop = () => {
        Patcher.unpatchAll();
        Styles.clear();
        plugin.stop();
        Logger.log("Disabled");
    };

    // add settings panel
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (
            <SettingsContainer name={name} onReset={() => Settings.reset()}>
                <ConnectedSettings/>
            </SettingsContainer>
        );
    }

    return Wrapper;
};
