import {createPlugin, Finder, Utils, React} from "dium";
import config from "./config.json";

export default createPlugin(config, ({Logger, Patcher}) => {
    return {
        start() {

        },
        stop() {}
    };
});
