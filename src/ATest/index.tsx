import {createPlugin, Finder} from "../../lib";
import config from "./config.json";

export default createPlugin(config, ({Logger}) => {
    const foo = Finder.byId(0);

    return {
        start() {
            Logger.log("Found module", foo);
        },
        stop() {}
    };
});
