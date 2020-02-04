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
	MessageHeader: BdApi.findModule((m) => m && m.default && m.default.displayName === "MessageHeader"),
};

/** Selector storage */
const Selector = {
	Message: BdApi.findModuleByProps("cozyMessage"),
	MessageHeader: BdApi.findModuleByProps("headerCozy")
};

/** Plugin styles */
const Styles = $include("./styles.scss") + `
.${Selector.Message.message}:hover .replyer {
	visibility: visible;
}`;

/** Plugin class */
class Plugin {

	start() {

		// inject styles
		this.injectCSS(Styles);

		// patch "MessageHeader" component
		this.createPatch(Module.MessageHeader, "default", {name: "MessageHeader", after: ({methodArguments: [props], returnValue}) => {

			// get message author & channel
			const {author} = props.message,
				channel = Module.Channels.getChannel(props.message.getChannelId());

			// ensure mode is cozy, author is not current user and user has permissions to send messages
			if (
				!props.isCompact
				&& author.id !== Module.Users.getCurrentUser().id
				&& (channel.isPrivate() || Module.Permissions.can(Module.Constants.Permissions.SEND_MESSAGES, channel))
			) {

				// add reply button to children
				returnValue.props.children = [
					returnValue.props.children,
					React.createElement("span", {
						className: "replyer",
						onClick: () => {
							Module.ComponentDispatch.dispatchToLastSubscribed(Module.Constants.ComponentActions.INSERT_TEXT, {
								content: `<@!${author.id}>`
							});
						}
					}, "Reply")
				].flat();
			}

			// return return value
			return returnValue;
		}});

		// fix the display name ("patched default" sucks)
		Module.MessageHeader.default.displayName = "MessageHeader";
	}

	stop() {}

}