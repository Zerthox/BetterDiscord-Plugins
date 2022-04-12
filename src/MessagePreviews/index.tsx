import {createPlugin, Finder, Utils, React} from "dium";
import config from "./config.json";

const MessageStore = Finder.byProps("getMessage", "getMessages");
const MessageActions = Finder.byProps("fetchMessages", "receiveMessages");

const Message = Finder.find((exports) => exports?.type?.toString().includes("message.id"))?.default as React.MemoExoticComponent<React.FunctionComponent<any>>;
const MaskedLink = Finder.byName("MaskedLink") as React.ComponentType<any>;
const PinnedMessage = Finder.find((exports) => exports?.type?.displayName === "ChannelMessage");

export default createPlugin(config, ({Logger, Patcher}) => {
    return {
        start() {
            Patcher.after(Message, "type", ({args: [props], result}) => {
                const listItem = Utils.queryTree(result, (node) => node?.props.childrenMessageContent);
                if (!listItem) {
                    Logger.warn("Unable to find message list item");
                    return;
                }

                listItem.props.childrenAccessories = [listItem.props.childrenAccessories].flat();

                const accessories = listItem.props.childrenAccessories as JSX.Element[];
                const content = [listItem.props.childrenMessageContent.props.content].flat() as JSX.Element[];
                for (const node of content) {
                    if (node?.type === MaskedLink) {
                        const {href} = node.props as {href: string};
                        // TODO: discord might have internals for parsing message links?
                        const matches = href.match(/^https:\/\/discord\.com\/channels\/\d+\/(\d+)\/(\d+)$/);
                        if (matches) {
                            const [, channelId, messageId] = matches;
                            const message = MessageStore.getMessage(channelId, messageId);

                            accessories.push(
                                message ? (
                                    <PinnedMessage
                                        key={`preview-${channelId}-${messageId}`}
                                        channel={props.channel}
                                        message={message}
                                    />
                                ) : <div>Message not loaded</div>
                            );
                        }
                    }
                }
            });
        },
        stop() {}
    };
});
