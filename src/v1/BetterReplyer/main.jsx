/**
 * BetterReplyer plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Constants: BdApi.findModuleByProps("Permissions"),
	Permissions: BdApi.findModuleByProps("getChannelPermissions"),
	Users: BdApi.findModuleByProps("getUser", "getCurrentUser"),
	ComponentDispatch: BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch
};

/** Component storage */
const Component = {
	Message: BdApi.findModuleByProps("Message", "MessageAvatar").Message,
};

/** Selector storage */
const Selector = {
	Messages: BdApi.findModuleByProps("container", "containerCozyBounded")
};

/** Plugin styles */
const Styles = _require("./styles.scss");

/** Plugin class */
class Plugin {
	
	start() {

		// inject styles
		this.injectCSS(Styles);
		
		// patch "Message" component render function
		this.createPatch(Component.Message.prototype, "render", {after: ({thisObject : {props}, returnValue}) => {

			// get message author
			const {author} = props.message;

			// return unmodified if disabled, compact, no header, author is current user or no permissions to send messages
			if (
				props.isDisabled
				|| props.isCompact
				|| !props.isHeader
				|| author.id === Module.Users.getCurrentUser().id
				|| !props.channel.isPrivate() && !Module.Permissions.can(Module.Constants.Permissions.SEND_MESSAGES, props.channel)
			) {
				return returnValue;
			}
			
			// find message header meta
			const meta = qReact(returnValue, (node) => node.props.className === Selector.Messages.headerCozyMeta);
			
			// check if message header meta found
			if (meta) {

				// add reply button to children
				meta.props.children = [
					meta.props.children,
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
	
			// return modified return value
			return returnValue;
		}});
		
		// force update
		this.forceUpdate(Selector.Messages.container);
	}
	
	stop() {

		// force update
		this.forceUpdate(Selector.Messages.container);
	}

}