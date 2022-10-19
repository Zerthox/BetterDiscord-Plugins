import {createPlugin, Finder, Filters, Patcher} from "dium";

const ReplyActions = Finder.demangle({createPendingReply: Filters.bySource(".shouldMention")}, null, true);

export default createPlugin({}, () => ({
    start() {
        Patcher.before(ReplyActions, "createPendingReply", ({args: [options]}) => {
            options.shouldMention = false;
        }, {name: "createPendingReply"});
    },
    stop() {}
}));
