import {createLogger, Logger} from "./logger";
import {createPatcher, Patcher} from "./patcher";
import {createStyles, Styles} from "./styles";
import {createData, Data} from "./data";
import {createSettings, Settings} from "./settings";
import {React} from "./modules";

export * as Utils from "./utils";
export {default as Finder} from "./finder";
export * as Modules from "./modules";
export {React, ReactDOM, classNames, lodash, Flux} from "./modules";
export {ReactInternals, ReactDOMInternals} from "./react";
export {version} from "../package.json";

export {Logger} from "./logger";
export {Patcher} from "./patcher";
export {Styles} from "./styles";
export {Data} from "./data";
export {Settings} from "./settings";

export interface Api<S extends Record<string, any>, D extends {settings: S}> {
    Logger: Logger;
    Patcher: Patcher;
    Styles: Styles;
    Data: Data<D>;
    Settings: Settings<S, D>;
}

export interface Config<S extends Record<string, any>> {
    name: string;
    version: string;
    author: string;
    description?: string;
    styles?: string;
    settings?: S;
}

export interface Plugin<S> {
    start: () => void | Promise<void>;
    stop: () => void | Promise<void>;
    settingsPanel?: React.ComponentType<S>;
}

export const createPlugin = <S extends Record<string, any>, D extends {settings: S}>(
    {name, version, styles: css, settings}: Config<S>,
    callback: (api: Api<S, D>) => Plugin<S>
) => {
    // create log
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData<D>(name);
    const Settings = createSettings(Data, settings ?? {} as S);

    // get plugin info
    const plugin = callback({Logger, Patcher, Styles, Data, Settings});

    // construct wrapper
    function Wrapper() {}
    Wrapper.prototype.start = async () => {
        Logger.log("Enabled");
        Styles.inject(css);
        await plugin.start();
    };
    Wrapper.prototype.stop = async () => {
        Patcher.unpatchAll();
        Styles.clear();
        await plugin.stop();
        Logger.log("Disabled");
    };

    // add settings panel
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => <ConnectedSettings/>;
    }

    return Wrapper;
};
