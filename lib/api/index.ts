import Modules from "./modules";
import {createLog, Log} from "./log";
import * as ReactUtils from "./react";
import {Config} from "..";

export interface Api {
    config?: Config;
    Log?: Log;
    Modules: typeof Modules;
    ReactUtils: typeof ReactUtils;
}

export default {Modules} as Api;

export const createInstance = (config: Config): Api => {
    return {
        config,
        Modules,
        ReactUtils,
        Log: createLog(config.name, "#3a71c1", config.version)
    };
};
