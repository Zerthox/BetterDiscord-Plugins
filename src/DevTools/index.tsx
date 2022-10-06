import * as dium from "dium";
import * as Modules from "dium/modules";
import * as Components from "dium/components";
import * as DevFinder from "./finder";

// add extensions
const diumGlobal = {
    ...dium,
    Finder: {...dium.Finder, dev: DevFinder},
    Modules,
    Components
};

declare global {
    interface Window {
        dium?: typeof diumGlobal;
    }
}

export default dium.createPlugin({}, () => ({
    start() {
        window.dium = diumGlobal;
    },
    stop() {
        delete window.dium;
    }
}));
