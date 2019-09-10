/**
 * BetterReplyer plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Constants: BdApi.findModuleByProps("Permissions"),
	Permissions: BdApi.findModuleByProps("getChannelPermissions"),
	Drafts: BdApi.findModuleByProps("getDraft"),
	DraftActions: BdApi.findModuleByProps("saveDraft"),
	Users: BdApi.findModuleByProps("getUser", "getCurrentUser")
};

/** Component storage */
const Component = {
	Message: BdApi.findModuleByProps("Message", "MessageAvatar").Message,
	ChannelTextArea: BdApi.findModuleByDisplayName("ChannelTextArea")
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
		this.focused = null;
		this.selection = [0, 0];
		this.mode = false;
	}
	
	start() {

		// inject styles
		this.injectCSS(Styles);
		
		// patch "Message" component render function
		this.createPatch(Component.Message.prototype, "render", {after: (d) => {

			// get this & old return value
			const t = d.thisObject,
				r = d.returnValue;

			// get message author id
			const id = t.props.message.author.id;

			// return unmodified if disabled, compact, no header or author is current user
			if (t.props.isDisabled || t.props.isCompact || !t.props.isHeader || id === Module.Users.getCurrentUser().id) {
				return r;
			}

			// get current channel permissions
			const p = Module.Permissions.getChannelPermissions(t.props.channel.id);

			// return unmodified if no permissions to send messages
			if (typeof p === "number" && !(p & Module.Constants.Permissions.SEND_MESSAGES)) {
				return r;
			}
			
			// find message header
			const h = [t.props.jumpSequenceId ? r.props.children.props.children : r.props.children].flat().find((e) => e.props && e.props.className === Selector.Messages.headerCozy);
			
			// find message header meta
			const m = h && [h.props.children].flat().find((e) => e.props && e.props.className === Selector.Messages.headerCozyMeta);

			
			// check if message header meta found
			if (m) {

				// get children
				const c = [m.props.children].flat();

				// push reply button
				c.push(React.createElement("span", {
					className: "replyer",
					onClick: () => {

						// get saved text area
						const f = this.focused;

						// check if text area saved
						if (f) {

							// focus textarea
							f.focus();

							// check mode
							if (this.mode) {

								// select saved selection
								f.setSelectionRange(this.selection[0], this.selection[1]);

								// insert mention
								document.execCommand("insertText", false, `<@!${id}>`);

								// update saved text area
								setTimeout(() => {
									this.focused = f;
								}, 100);
							}
							else {

								// get mention
								const m = `<@!${id}> `;
							
								// go to start of textarea
								f.setSelectionRange(0, 0);
							
								// insert mention
								document.execCommand("insertText", false, m);
							
								// select saved selection
								f.setSelectionRange(this.selection[0] + m.length, this.selection[1] + m.length); 
							}
						}
						else {

							// default to current channel
							Module.DraftActions.saveDraft(t.props.channel.id, `<@!${id}> ${Module.Drafts.getDraft(t.props.channel.id)}`);
						}
					}
				}, "Reply"));

				// override children
				m.props.children = c;
			}

			// return modified return value
			return r;
		}});

		// patch "ChannelTextArea" component render function
		this.createPatch(Component.ChannelTextArea.prototype, "render", {instead: (d) => {

			// get this
			const t = d.thisObject;

			// declare blur handler
			const f = () => {

				// get dom node
				const e = ReactDOM.findDOMNode(d.thisObject).querySelector("textarea");

				// save focused textarea
				this.focused = e;

				// save selection
				this.selection = [e.selectionStart, e.selectionEnd];

				// set mode
				this.mode = true;

				// reset mode after 100ms
				setTimeout(() => {
					if (this.focused === e) {
						this.mode = false;
					}
				}, 100);
			};

			// check if text area has a blur handler
			if (t.props.onBlur) {
				
				// patch blur handler
				BdApi.monkeyPatch(t.props, "onBlur", {silent: true, before: f});
			}
			else {

				// assign blur handler
				t.props.onBlur = f;
			}

			// return render with modified this
			return d.originalMethod.apply(t);
		}});
		
		// force update
		this.forceUpdate(Selector.Messages.container);
	}
	
	stop() {

		// reset saved text area, selection & mode
		this.focused = null;
		this.selection = [0, 0];
		this.mode = false;

		// force update
		this.forceUpdate(Selector.Messages.container);
	}

}