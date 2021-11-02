import {createInstance, Api} from "./api";

export {Api} from "./api";

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
    // create api
    const api = createInstance(config);
    const {Log} = api;

    // get plugin info
    const plugin = callback(api);

    // construct wrapper
    return class Wrapper {
        async start() {
            Log.log("Enabled");
            await plugin.start();
        }
        async stop() {
            await plugin.stop();
            Log.log("Disabled");
        }
    };
};
