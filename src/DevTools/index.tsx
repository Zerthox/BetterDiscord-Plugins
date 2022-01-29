import * as Discordium from "discordium";
import * as DevFinder from "./finder";
import config from "./config.json";

// add finder extension
const {Finder} = Discordium;
(Finder as any).dev = DevFinder;

export default Discordium.createPlugin(config, () => ({
    start() {
        // expose discordium as global
        global.Discordium = Discordium;
        global.dium = Discordium;
    },
    stop() {
        // remove global
        delete global.Discordium;
        delete global.dium;
    }
}));
