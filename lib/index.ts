import {createLogger, Logger} from "./log";
import {createPatcher, Patcher} from "./patch";

export {default as Finder} from "./finder";
export * as Modules from "./modules";
export {React, ReactDOM, classNames, lodash} from "./modules";
export * as ReactUtils from "./react";
export {Logger as Log} from "./log";
export {Patcher as Patch} from "./patch";

export interface Api {
    Logger: Logger;
    Patcher: Patcher;
}

export interface Config {
    name: string;
    version: string;
    author: string;
    description: string;
}

export interface Plugin {
    start: () => void | Promise<void>;
    stop: () => void | Promise<void>;
    settings?: () => JSX.Element;
}

export const createPlugin = (config: Config, callback: (api: Api) => Plugin) => {
    // create log
    const Logger = createLogger(config.name, "#3a71c1", config.version);
    const Patcher = createPatcher(config, Logger);

    // get plugin info
    const plugin = callback({Logger, Patcher});

    // construct wrapper
    return class Wrapper {
        async start() {
            Logger.log("Enabled");
            await plugin.start();
        }
        async stop() {
            await plugin.stop();
            Logger.log("Disabled");
        }
    };
};
