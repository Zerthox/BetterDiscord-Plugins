import * as Discordium from "discordium";
import config from "./config.json";

// expose discordium as global
global.Discordium = Discordium;

// export a dummy plugin
export default Discordium.createPlugin(config, () => ({
    start() {},
    stop() {}
}));
