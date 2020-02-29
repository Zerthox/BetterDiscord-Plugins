/**
 * BetterReplyer plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Constants: BdApi.findModuleByProps("Permissions"),
	Channels: BdApi.findModuleByProps("getChannel"),
	Users: BdApi.findModuleByProps("getUser", "getCurrentUser"),
	Permissions: BdApi.findModuleByProps("getChannelPermissions"),
	ComponentDispatch: BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch,
};

/** Component storage */
const Component = {
	MessageHeader: BdApi.findModuleByProps("MessageTimestamp")
};

/** Selector storage */
const Selector = {
	Message: BdApi.findModuleByProps("cozyMessage"),
	MessageContent: BdApi.findModuleByProps("isSending")
};

/** Plugin styles */
const Styles = $include("./styles.scss") + `
.${Selector.Message.message.replace(/\s/g, ".")}:hover .replyer {
	visibility: visible;
}`;

/** Plugin class */
class Plugin {

	start() {

		// inject styles
		this.injectCSS(Styles);

		// patch message header component
		this.createPatch(Component.MessageHeader, "default", {name: "MessageHeader", after({methodArguments: [props], returnValue}) {

			// get message author & channel
			const {author} = props.message,
				channel = Module.Channels.getChannel(props.message.getChannelId());

			// ensure mode is cozy, author is not current user and user has permissions to send messages
			if (
				!props.isCompact
				&& author.id !== Module.Users.getCurrentUser().id
				&& (channel.isPrivate() || Module.Permissions.can(Module.Constants.Permissions.SEND_MESSAGES, channel))
			) {

				// find header & append reply button
				const h2 = qReact(returnValue, (e) => e.props.className === Selector.MessageContent.header);
				if (h2) {
					h2.props.children = [
						h2.props.children,
						React.createElement("span", {
							className: "replyer",
							onClick() {
								Module.ComponentDispatch.dispatchToLastSubscribed(Module.Constants.ComponentActions.INSERT_TEXT, {
									content: `<@!${author.id}>`
								});
							}
						}, "Reply")
					].flat();
				}
			}

			// return return value
			return returnValue;
		}});

		// remove artificial display name
		delete Component.MessageHeader.default.displayName;

	}

	stop() {}

}