/**
 * @name BetterReplyer
 * @author Zerthox
 * @version 4.1.2
 * @description Reply to people using their ID with a button.\nInspired by Replyer by @Hammmock#3110, @Natsulus#0001 & @Zerebos#7790.
 * @source https://github.com/Zerthox/BetterDiscord-Plugins
 */

/*@cc_on
	@if (@_jscript)
		var name = WScript.ScriptName.split(".")[0];
		var shell = WScript.CreateObject("WScript.Shell");
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		shell.Popup("Do NOT run random scripts from the internet with the Windows Script Host!\n\nYou are supposed to move this file to your BandagedBD/BetterDiscord plugins folder.", 0, name + ": Warning!", 0x1030);
		var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
		if (!fso.FolderExists(pluginsPath)) {
			if (shell.Popup("Unable to find the BetterDiscord plugins folder on your computer.\nOpen the download page of BandagedBD/BetterDiscord?", 0, name + ": BetterDiscord installation not found", 0x14) === 6) {
				shell.Exec("explorer \"https://github.com/rauenzi/betterdiscordapp/releases\"");
			}
		}
		else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
			shell.Popup("This plugin is already in the correct folder.\nNavigate to the \"Plugins\" settings tab in Discord and enable it there.", 0, name, 0x40);
		}
		else {
			shell.Exec("explorer " + pluginsPath);
		}
		WScript.Quit();
	@else
@*/

const {React, ReactDOM} = BdApi,
	Flux = BdApi.findModuleByProps("connectStores");

function qReact(node, query) {
	let match = false;

	try {
		match = query(node);
	} catch (err) {
		console.debug("Suppressed error in qReact query:\n", err);
	}

	if (match) {
		return node;
	} else if (node && node.props && node.props.children) {
		for (const child of [node.props.children].flat()) {
			const result = arguments.callee(child, query);

			if (result) {
				return result;
			}
		}
	}

	return null;
}

const Module = {
	Constants: BdApi.findModuleByProps("Permissions"),
	Permissions: BdApi.findModuleByProps("getChannelPermissions"),
	Drafts: BdApi.findModuleByProps("getDraft"),
	DraftActions: BdApi.findModuleByProps("saveDraft"),
	Users: BdApi.findModuleByProps("getUser", "getCurrentUser")
};
const Component = {
	Message: BdApi.findModuleByProps("Message", "MessageAvatar").Message,
	ChannelTextArea: BdApi.findModuleByDisplayName("ChannelTextArea")
};
const Selector = {
	Messages: BdApi.findModuleByProps("container", "containerCozyBounded"),
	TextArea: BdApi.findModuleByProps("channelTextArea")
};
const Styles = `/*! BetterReplyer styles */
/*! Powered by DiscordSelectors v0.1.4 */
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

.container-1YxwTf:not(:hover) .replyer {
  visibility: hidden;
}`;

class Plugin {
	constructor() {
		this.focused = null;
		this.selection = [0, 0];
		this.mode = false;
	}

	start() {
		this.injectCSS(Styles);
		this.createPatch(Component.Message.prototype, "render", {
			after: (d) => {
				const t = d.thisObject,
					r = d.returnValue;
				const id = t.props.message.author.id;

				if (
					t.props.isDisabled ||
					t.props.isCompact ||
					!t.props.isHeader ||
					id === Module.Users.getCurrentUser().id
				) {
					return r;
				}

				const p = Module.Permissions.getChannelPermissions(t.props.channel.id);

				if (typeof p === "number" && !(p & Module.Constants.Permissions.SEND_MESSAGES)) {
					return r;
				}

				const h = [t.props.jumpSequenceId ? r.props.children.props.children : r.props.children]
					.flat()
					.find((e) => e.props && e.props.className === Selector.Messages.headerCozy);
				const m =
					h &&
					[h.props.children]
						.flat()
						.find((e) => e.props && e.props.className === Selector.Messages.headerCozyMeta);

				if (m) {
					const c = [m.props.children].flat();
					c.push(
						React.createElement(
							"span",
							{
								className: "replyer",
								onClick: () => {
									const f = this.focused;

									if (f) {
										f.focus();

										if (this.mode) {
											f.setSelectionRange(this.selection[0], this.selection[1]);
											document.execCommand("insertText", false, `<@!${id}>`);
											setTimeout(() => {
												this.focused = f;
											}, 100);
										} else {
											const m = `<@!${id}> `;
											f.setSelectionRange(0, 0);
											document.execCommand("insertText", false, m);
											f.setSelectionRange(
												this.selection[0] + m.length,
												this.selection[1] + m.length
											);
										}
									} else {
										Module.DraftActions.saveDraft(
											t.props.channel.id,
											`<@!${id}> ${Module.Drafts.getDraft(t.props.channel.id)}`
										);
									}
								}
							},
							"Reply"
						)
					);
					m.props.children = c;
				}

				return r;
			}
		});
		this.createPatch(Component.ChannelTextArea.prototype, "render", {
			instead: (d) => {
				const t = d.thisObject;

				const f = () => {
					const e = ReactDOM.findDOMNode(d.thisObject).querySelector("textarea");
					this.focused = e;
					this.selection = [e.selectionStart, e.selectionEnd];
					this.mode = true;
					setTimeout(() => {
						if (this.focused === e) {
							this.mode = false;
						}
					}, 100);
				};

				if (t.props.onBlur) {
					BdApi.monkeyPatch(t.props, "onBlur", {
						silent: true,
						before: f
					});
				} else {
					t.props.onBlur = f;
				}

				return d.originalMethod.apply(t);
			}
		});
		this.forceUpdate(Selector.Messages.container);
	}

	stop() {
		this.focused = null;
		this.selection = [0, 0];
		this.mode = false;
		this.forceUpdate(Selector.Messages.container);
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "BetterReplyer";
	}

	getVersion() {
		return "4.1.2";
	}

	getAuthor() {
		return "Zerthox";
	}

	getDescription() {
		return "Reply to people using their ID with a button.\nInspired by Replyer by @Hammmock#3110, @Natsulus#0001 & @Zerebos#7790.";
	}

	log(msg, log = console.log) {
		log(
			`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`,
			"color: #3a71c1; font-weight: 700;",
			"color: #666; font-size: .8em;",
			""
		);
	}

	constructor() {
		super(...arguments);
		this._Patches = [];

		if (this.defaults) {
			this.settings = Object.assign({}, this.defaults, this.loadData("settings"));
		}
	}

	start() {
		this.log("Enabled");
		super.start();
	}

	stop() {
		while (this._Patches.length > 0) {
			this._Patches.pop()();
		}

		this.log("Unpatched all");

		if (document.getElementById(this.getName())) {
			BdApi.clearCSS(this.getName());
		}

		super.stop();

		if (this._settingsRoot) {
			ReactDOM.unmountComponentAtNode(this._settingsRoot);
			delete this._settingsRoot;
		}

		this.log("Disabled");
	}

	saveData(id, value) {
		return BdApi.saveData(this.getName(), id, value);
	}

	loadData(id, fallback = null) {
		const l = BdApi.loadData(this.getName(), id);
		return l ? l : fallback;
	}

	injectCSS(css) {
		const el = document.getElementById(this.getName());

		if (!el) {
			BdApi.injectCSS(this.getName(), css);
		} else {
			el.innerHTML += "\n\n/* --- */\n\n" + css;
		}
	}

	createPatch(target, method, options) {
		options.silent = true;

		this._Patches.push(BdApi.monkeyPatch(target, method, options));

		const name =
			options.name ||
			target.displayName ||
			target.name ||
			target.constructor.displayName ||
			target.constructor.name ||
			"Unknown";
		this.log(
			`Patched ${method} of ${name} ${
				options.type === "component" || target instanceof React.Component ? "component" : "module"
			}`
		);
	}

	async forceUpdate(...classes) {
		this.forceUpdateElements(
			...classes.map((e) => document.getElementsByClassName(e)).reduce((p, e) => p.append(e))
		);
	}

	async forceUpdateElements(...elements) {
		for (const el of elements) {
			try {
				let fiber = BdApi.getInternalInstance(el);

				if (fiber) {
					while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
						fiber = fiber.return;
					}

					fiber.stateNode.forceUpdate();
				}
			} catch (e) {
				this.log(
					`Failed to force update "${
						el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName
					}" state node`,
					console.warn
				);
				console.error(e);
			}
		}
	}
};

if (Plugin.prototype.getSettings) {
	module.exports.prototype.getSettingsPanel = function() {
		const Flex = BdApi.findModuleByDisplayName("Flex"),
			Button = BdApi.findModuleByProps("Link", "Hovers"),
			Form = BdApi.findModuleByProps("FormItem", "FormSection", "FormDivider"),
			Margins = BdApi.findModuleByProps("marginLarge");
		const SettingsPanel = Object.assign(this.getSettings(), {
			displayName: "SettingsPanel"
		});
		const self = this;

		class Settings extends React.Component {
			constructor(props) {
				super(props);
				this.state = this.props.settings;
			}

			render() {
				const props = Object.assign(
					{
						update: (e) => this.setState(e, () => this.props.update(this.state))
					},
					this.state
				);
				return React.createElement(
					Form.FormSection,
					null,
					React.createElement(
						Form.FormTitle,
						{
							tag: "h2"
						},
						this.props.name,
						" Settings"
					),
					React.createElement(SettingsPanel, props),
					React.createElement(Form.FormDivider, {
						className: [Margins.marginTop20, Margins.marginBottom20].join(" ")
					}),
					React.createElement(
						Flex,
						{
							justify: Flex.Justify.END
						},
						React.createElement(
							Button,
							{
								size: Button.Sizes.SMALL,
								onClick: () => {
									BdApi.showConfirmationModal(this.props.name, "Reset all settings?", {
										onConfirm: () => {
											this.props.reset();
											this.setState(self.settings);
										}
									});
								}
							},
							"Reset"
						)
					)
				);
			}
		}

		Settings.displayName = this.getName() + "Settings";

		if (!this._settingsRoot) {
			this._settingsRoot = document.createElement("div");
			this._settingsRoot.className = `settingsRoot-${this.getName()}`;
			ReactDOM.render(
				React.createElement(Settings, {
					name: this.getName(),
					settings: this.settings,
					update: (state) => this.saveData("settings", Object.assign(this.settings, state)),
					reset: () => {
						this.saveData("settings", Object.assign(this.settings, this.defaults));
					}
				}),
				this._settingsRoot
			);
		}

		return this._settingsRoot;
	};
}

/*@end@*/
