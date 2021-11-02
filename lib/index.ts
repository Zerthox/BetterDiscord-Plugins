import {createLog, Log} from "./log";
export {default as Modules} from "./modules";
export * as ReactUtils from "./react";

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

export const createPlugin = (config: Config, callback: (log: Log) => Plugin) => {
    // create log
    const log = createLog(config.name, "#3a71c1", config.version);

    // get plugin info
    const plugin = callback(log);

    // construct wrapper
    return class Wrapper {
        async start() {
            log.log("Enabled");
            await plugin.start();
        }
        async stop() {
            await plugin.stop();
            log.log("Disabled");
        }
    };
};
