import {confirm} from "./utils";
import {createLogger, Logger} from "./logger";
import {createPatcher, Patcher} from "./patcher";
import {createStyles, Styles} from "./styles";
import {createData, Data} from "./data";
import {createSettings, Settings, SettingsProps} from "./settings";
import {React, classNames} from "./modules";
import {Flex, Button, Form, margins} from "./discord";

export * as Utils from "./utils";
export * as Finder from "./finder";
export * as Modules from "./modules";
export {React, ReactDOM, classNames, lodash, Flux} from "./modules";
export {ReactInternals, ReactDOMInternals} from "./react";
export * as Discord from "./discord";
export * as Types from "./types";
export {version} from "../package.json";

export {Logger} from "./logger";
export {Patcher} from "./patcher";
export {Styles} from "./styles";
export {Data} from "./data";
export {Settings, SettingsProps} from "./settings";

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
    start(): void | Promise<void>;
    stop(): void | Promise<void>;
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
        const promise = plugin.stop();
        if (promise) {
            promise.then(() => Logger.log("Disabled"));
        } else {
            Logger.log("Disabled");
        }
    };

    // add settings panel
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (
            <Form.FormSection>
                <ConnectedSettings/>
                <Form.FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
                <Flex justify={Flex.Justify.END}>
                    <Button
                        size={Button.Sizes.SMALL}
                        onClick={() => confirm(name, "Reset all settings?", {
                            onConfirm: () => Settings.reset()
                        })}
                    >Reset</Button>
                </Flex>
            </Form.FormSection>
        );
    }

    return Wrapper;
};
