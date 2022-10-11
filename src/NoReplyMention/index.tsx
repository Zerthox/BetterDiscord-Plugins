import {createPlugin, Finder, Filters} from "dium";

const filter = Filters.bySource(".shouldMention");

const ReplyActions = Finder.find(Filters.byEntry(filter));
const [key] = Object.entries(ReplyActions).find(([, value]) => filter(value));

export default createPlugin({}, ({Patcher}) => ({
    start() {
        Patcher.before(ReplyActions, key, ({args: [options]}) => {
            options.shouldMention = false;
        }, {name: "createPendingReply"});
    },
    stop() {}
}));
