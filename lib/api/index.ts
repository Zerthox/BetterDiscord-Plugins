import finder, {Finder} from "./finder";
import {createLogger, Logger} from "./logger";
import {Config} from "..";

export interface Api {
    config?: Config;
    Finder: Finder;
    Logger?: Logger;
}

export default {Finder: finder} as Api;

export const createInstance = (config: Config): Api => {
    return {
        config,
        Finder: finder,
        Logger: createLogger(config.name, "#3a71c1", config.version)
    };
};
