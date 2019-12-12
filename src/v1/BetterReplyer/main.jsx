/**
 * BetterReplyer plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Constants: BdApi.findModuleByProps("Permissions"),
	Permissions: BdApi.findModuleByProps("getChannelPermissions"),
	Users: BdApi.findModuleByProps("getUser", "getCurrentUser")
};

/** Component storage */
const Component = {
	Message: BdApi.findModuleByProps("Message", "MessageAvatar").Message,
	SlateChannelTextArea: BdApi.findModuleByDisplayName("SlateChannelTextArea")
};

/** Selector storage */
const Selector = {
	Messages: BdApi.findModuleByProps("container", "containerCozyBounded"),
	TextArea: BdApi.findModuleByProps("channelTextArea")
};

/** Plugin styles */
const Styles = _require("./styles.scss");

/** Plugin class */
class Plugin {

	constructor() {
		this.editor = null;
		this.focused = false;
	}
	
	start() {

		// inject styles
		this.injectCSS(Styles);
		
		// patch "Message" component render function
		this.createPatch(Component.Message.prototype, "render", {after: ({thisObject, returnValue}) => {

			// get message author
			const {author} = thisObject.props.message;

			// return unmodified if disabled, compact, no header or author is current user
			if (thisObject.props.isDisabled || thisObject.props.isCompact || !thisObject.props.isHeader || author.id === Module.Users.getCurrentUser().id) {
				return returnValue;
			}

			// get current channel permissions
			const perms = Module.Permissions.getChannelPermissions(thisObject.props.channel.id);

			// return unmodified if no permissions to send messages
			if (typeof perms === "number" && !(perms & Module.Constants.Permissions.SEND_MESSAGES)) {
				return returnValue;
			}
			
			// find message header meta
			const meta = qReact(returnValue, (node) => node.props.className === Selector.Messages.headerCozyMeta);
			
			// check if message header meta found
			if (meta) {

				// get children
				const children = [meta.props.children].flat();

				// push reply button
				children.push(React.createElement("span", {
					className: "replyer",
					onClick: () => {
						if (this.focused) {
							this.editor.insertText(`<@!${author.id}>`);
						}
						else {
							this.editor.applyOperation({
								type: "insert_text",
								path: [0, 0],
								offset: 0,
								text: `<@!${author.id}> `
							});
						}
						this.editor.focus();
					}
				}, "Reply"));

				// override children
				meta.props.children = children;
			}
	
			// return modified return value
			return returnValue;
		}});

		// patch "SlateChannelTextArea" component onFocus & onBlur
		this.createPatch(Component.SlateChannelTextArea.prototype, "render", {before: ({thisObject}) => {
			const editor = thisObject._editorRef;
			if (editor) {
				this.editor = editor;
				BdApi.monkeyPatch(editor, "focus", {silent: true, before: () => {
					this.editor = editor;
					this.focused = true;
				}});
				BdApi.monkeyPatch(editor, "blur", {silent: true, after: () => {
					setTimeout(() => {
						this.focused = false;
					}, 100);
				}});
			}
		}});
		
		// force update
		this.forceUpdate(Selector.Messages.container, Selector.TextArea.textArea);
	}
	
	stop() {
		this.editor = null;
		this.focused = false;

		// force update
		this.forceUpdate(Selector.Messages.container, Selector.TextArea.textArea);
	}

}