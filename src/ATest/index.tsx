import {createPlugin} from "../../lib";
import config from "./config.json";

export default createPlugin(config, ({Modules, Log}) => {
    const foo = Modules.byId(0);

    return {
        start() {
            Log.log("Found module", foo);
        },
        stop() {}
    };
});
