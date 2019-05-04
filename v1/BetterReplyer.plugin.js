//META {"name": "BetterReplyer", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/BetterReplyer.plugin.js"} *//

/**
 * @author Zerthox
 * @version 4.0.0
 * @return {class} BetterReplyer Plugin class
 */
const BetterReplyer = (() => {

	// Api constants
	const {React, ReactDOM} = BdApi;

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
		ChannelTextArea: BDV2.WebpackModules.findByDisplayName("ChannelTextArea")
	};

	/** Selector storage */
	const Selector = {
		Messages: BdApi.findModuleByProps("message", "container", "headerCozy"),
		TextArea: BdApi.findModuleByProps("channelTextArea")
	};

	/** Storage for Patches */
	const Patches = {};

	// return plugin class
	return class BetterReplyer {

		/**
		 * @return {string} Plugin name
		 */
		getName() {
			return "BetterReplyer";
		}

		/**
		 * @return {string} Plugin version
		 */
		getVersion() {
			return "4.0.0";
		}

		/**
		 * @return {ReactElement} Plugin author
		 */
		getAuthor() {
			return this.createAnchor({text: "Zerthox", url: "https://github.com/Zerthox"});
		}

		/**
		 * @return {ReactElement} Plugin description
		 */
		getDescription() {
			return React.createElement("span", {style: {"white-space": "pre-line"}},
				"Reply to people using their ID with a button.\n Inspired by ",
				this.createAnchor({text: "Replyer", url: "https://github.com/cosmicsalad/Discord-Themes-and-Plugins/blob/master/plugins/replyer.plugin.js"}),
				" by ",
				this.createAnchor({text: "@Hammmock#3110", url: "https://github.com/cosmicsalad"}),
				", ",
				this.createAnchor({text: "@Natsulus#0001", url: "https://github.com/Delivator"}),
				" & ",
				this.createAnchor({text: "@Zerebos#7790", url: "https://github.com/rauenzi"}),
				"."
			);
		}

		/**
		 * Log a message in Console
		 * @param {string} msg message
		 */
		log(msg) {
			console.log(`%c[${this.getName()}]%c (v${this.getVersion()})%c ${msg}`, "color: #3a71c1; font-weight: 700;", "font-size: .8em; color: hsla(0, 0%, 100%, .3);", "");
		}

		/**
		 * Create a new Anchor element based on Discord's Anchor Component
		 * @param {object} props Component props
		 * @param {string} props.text Anchor text
		 * @param {string} props.url Anchor url
		 * @return {ReactElement} New Anchor element
		 */
		createAnchor(props) {
			return BdApi.React.createElement(BDV2.WebpackModules.findByDisplayName("Anchor"), {href: props.url, target: "_blank", title: props.url}, props.text);
		}

		/**
		 * Plugin constructor
		 */
		constructor() {
			this.focused = null;
			this.selection = [0, 0];
			this.mode = false;
		}
		
		/**
		 * Plugin start function
		 */
		start() {

			// inject styles
			BdApi.injectCSS(this.getName(),
				`/* BetterReplyer CSS */
				.replyer {
					position: relative;
					top: -1px;
					margin-left: 5px;
					padding: 3px 5px;
					background: rgba(0, 0, 0, 0.4);
					border-radius: 3px;
					color: #fff !important;
					font-size: 10px;
					text-transform: uppercase;
					cursor: pointer;
				}
				${Selector.Messages.messageContainer}:not(:hover) .replyer {
					visibility: hidden;
				}`
			);
			
			// patch message render function
			Patches.message = BdApi.monkeyPatch(Component.Message.prototype, "render", {silent: true, after: (d) => {

				// get this & old return value
				const t = d.thisObject,
					r = d.returnValue;

				// get message author id
				const id = t.props.message.author.id;

				// return unmodified if disabled, compact, no header, author is current user or no permission to send messages
				if (t.props.isDisabled || t.props.isCompact || !t.props.isHeader || id === Module.Users.getCurrentUser().id || !(Module.Constants.Permissions.SEND_MESSAGES & Module.Permissions.getChannelPermissions(t.props.channel.id))) {
					return r;
				}
				
				// find message header
				const h = r.props.children.find((e) => e.props && e.props.className === Selector.Messages.headerCozy);

				// find message header meta
				const m = h && h.props.children.find((e) => e.props && e.props.className === Selector.Messages.headerCozyMeta);
				
				// add reply button
				m && m.props.children.push(React.createElement("span", {
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

				// return modified return value
				return r;
			}});
			this.log("Patched render of Message");

			// patch channel text area render function
			Patches.textarea = BdApi.monkeyPatch(Component.ChannelTextArea.prototype, "render", {silent: true, instead: (d) => {

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
			this.log("Patched onBlur of ChannelTextArea");
			
			// force update
			this.forceUpdateAll();
			
			// console output
			this.log("Enabled");
		}
		
		/**
		 * Plugin stop function
		 */
		stop() {

			// reset saved text area, selection & mode
			this.focused = null;
			this.selection = [0, 0];
			this.mode = false;

			// clear styles
			BdApi.clearCSS(this.getName());

			// revert all patches
			for (const k in Patches) {
				Patches[k]();
				delete Patches[k];
			}
			this.log("Unpatched all");

			// force update
			this.forceUpdateAll();

			// console output
			this.log("Disabled");
		}

		/**
		 * Force update the "Message" & "ChannelTextArea" Component State Nodes
		 */
		forceUpdateAll() {

			// force update messages
			for (const e of document.getElementsByClassName(Selector.Messages.message)) {
				const i = BdApi.getInternalInstance(e);
				i && i.return.stateNode.forceUpdate && i.return.stateNode.forceUpdate();
			}
			
			// force update channel text areas
			for (const e of document.getElementsByClassName(Selector.TextArea.channelTextArea)) {
				const i = BdApi.getInternalInstance(e);
				i && i.return.stateNode.forceUpdate && i.return.stateNode.forceUpdate();
			}
		}

	}
})();