import * as dium from "dium";
import * as DevFinder from "./finder";
import config from "./config.json";

// add finder extension
const {Finder} = dium;
(Finder as any).dev = DevFinder;

export default dium.createPlugin(config, () => ({
    start() {
        // expose as global
        global.dium = dium;
    },
    stop() {
        // remove global
        delete global.dium;
    }
}));
