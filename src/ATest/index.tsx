import {createPlugin, Modules} from "../../lib";
import config from "./config.json";

export default createPlugin(config, (Log) => {
    const foo = Modules.byId(0);

    return {
        start() {
            Log.log("Found module", foo);
        },
        stop() {}
    };
});
