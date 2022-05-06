import * as dium from "dium";
import * as DevFinder from "./finder";
import config from "./config.json";

declare global {
    interface Window {
        dium?: typeof dium;
    }
}

// add finder extension
const {Finder} = dium;
(Finder as any).dev = DevFinder;

export default dium.createPlugin(config, () => ({
    start() {
        // expose as global
        window.dium = dium;
    },
    stop() {
        // remove global
        delete window.dium;
    }
}));
