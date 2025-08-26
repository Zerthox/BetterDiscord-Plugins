import * as dium from "dium";
import * as Modules from "@dium/modules";
import * as Components from "@dium/components";
import * as DevFinder from "./finder";

const { Logger } = dium;

// add extensions
const diumGlobal = {
    ...dium,
    Finder: { ...dium.Finder, dev: DevFinder },
    Modules,
    Components,
};

declare global {
    interface Window {
        dium?: typeof diumGlobal;
    }
}

const checkForMissing = (type: string, toCheck: Record<string, any>) => {
    const missing = Object.entries(toCheck)
        .filter(([, value]) => value === undefined || value === null)
        .map(([key]) => key);
    if (missing.length > 0) {
        Logger.warn(`Missing ${type}: ${missing.join(", ")}`);
    } else {
        Logger.log(`All ${type} found`);
    }
};

export default dium.createPlugin({
    start() {
        window.dium = diumGlobal;

        checkForMissing("modules", Modules);
        checkForMissing("components", Components);
    },
    stop() {
        delete window.dium;
    },
});
