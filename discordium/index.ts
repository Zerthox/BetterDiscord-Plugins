import {createLogger, Logger} from "./logger";
import {createPatcher, Patcher} from "./patcher";
import {createStyles, Styles} from "./styles";

export * as Utils from "./utils";
export {default as Finder} from "./finder";
export * as Modules from "./modules";
export {React, ReactDOM, classNames, lodash, Flux} from "./modules";
export {ReactInternals, ReactDOMInternals} from "./react";
export {version} from "../package.json";

export {Logger} from "./logger";
export {Patcher} from "./patcher";
export {Styles} from "./styles";

export interface Api {
    Logger: Logger;
    Patcher: Patcher;
    Styles: Styles;
}

export interface Config {
    name: string;
    version: string;
    author: string;
    description?: string;
    styles?: string;
    settings?: Record<string, any>;
}

export interface Plugin {
    start: () => void | Promise<void>;
    stop: () => void | Promise<void>;
    settings?: () => JSX.Element;
}

export const createPlugin = ({name, version, styles: css}: Config, callback: (api: Api) => Plugin) => {
    // create log
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);

    // get plugin info
    const plugin = callback({Logger, Patcher, Styles});

    // construct wrapper
    return class Wrapper {
        async start() {
            Logger.log("Enabled");
            Styles.inject(css);
            await plugin.start();
        }
        async stop() {
            Patcher.unpatchAll();
            Styles.clear();
            await plugin.stop();
            Logger.log("Disabled");
        }
    };
};
