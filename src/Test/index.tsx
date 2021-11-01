import {createPlugin, Api} from "../../lib";

const config = {
    name: "BetterVolume",
    author: "Zerthox",
    version: "1.0.0",
    description: "Set user volume values manually instead of using a limited slider."
};


export default createPlugin(config, ({Finder, Logger}: Api) => {
    const foo = Finder.byId(0);
    return {
        start() {
            Logger.log("Found module", foo);
        },
        stop() {}
    };
});
