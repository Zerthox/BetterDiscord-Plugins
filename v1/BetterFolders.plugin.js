/**
 * @name BetterFolders
 * @author Zerthox
 * @version 1.0.0
 * @description Add new functionality to server folders.
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
	ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
	FolderStore: BdApi.findModuleByProps("getExpandedFolders")
};
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	GuildFolder: BdApi.findModuleByDisplayName("GuildFolder"),
	GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
	Icon: BdApi.findModuleByDisplayName("Icon"),
	FormSection: BdApi.findModuleByDisplayName("FormSection"),
	FormTitle: BdApi.findModuleByDisplayName("FormTitle"),
	FormItem: BdApi.findModuleByDisplayName("FormItem"),
	FormText: BdApi.findModuleByDisplayName("FormText"),
	TextInput: BdApi.findModuleByDisplayName("TextInput"),
	RadioGroup: BdApi.findModuleByDisplayName("RadioGroup"),
	Button: BdApi.findModuleByProps("Link", "Hovers"),
	SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
	ImageInput: BdApi.findModuleByDisplayName("ImageInput")
};
const Selector = {
	flex: BdApi.findModuleByProps("flex"),
	folder: BdApi.findModuleByProps("folder", "expandedGuilds", "wrapper"),
	modal: BdApi.findModuleByProps("permissionsTitle"),
	button: BdApi.findModuleByProps("colorWhite")
};
const Folders = BdApi.loadData("BetterFolders", "folders") ? BdApi.loadData("BetterFolders", "folders") : {};
const Styles = `/*! BetterFolders styles */
/*! Powered by DiscordSelectors v0.1.4 */
.betterFolders-customIcon {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.betterFolders-preview {
  margin: 0 10px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16px;
  cursor: default;
}`;

function BetterFolderIcon(props) {
	const result = Component.FolderIcon.apply(this, arguments);

	if (props.expanded) {
		const icon = qReact(result, (e) => e.props.children.type.displayName === "Icon");

		if (icon) {
			icon.props.children = React.createElement("div", {
				className: "betterFolders-customIcon",
				style: {
					"background-image": `url(${Folders[props.folderId]}`
				}
			});
		}
	}

	return result;
}

class BetterFolderUploader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			icon: props.icon
		};
	}

	render() {
		return React.createElement(
			Component.Flex,
			{
				align: Selector.flex.alignCenter
			},
			React.createElement(
				Component.Button,
				{
					color: Selector.button.colorWhite,
					look: Selector.button.lookOutlined
				},
				"Upload Image",
				React.createElement(Component.ImageInput, {
					onChange: (e) => {
						this.setState(
							{
								icon: e
							},
							() => {
								this.props.onChange && this.props.onChange(this.state);
							}
						);
					}
				})
			),
			React.createElement(
				Component.FormText,
				{
					type: "description",
					style: {
						margin: "0 10px 0 40px"
					}
				},
				"Preview:"
			),
			React.createElement("div", {
				className: [Selector.folder.folder, "betterFolders-preview"].join(" "),
				style: {
					"background-image": this.state.icon ? `url(${this.state.icon})` : null
				}
			})
		);
	}
}

class Plugin {
	constructor() {
		this.defaults = {
			closeOnOpen: false
		};
	}

	getSettings() {
		return (props) =>
			React.createElement(
				Component.SwitchItem,
				{
					note: "Close other folders when opening a new folder",
					hideBorder: true,
					value: props.closeOnOpen,
					onChange: (event) => {
						const enabled = event.currentTarget.checked;

						if (enabled) {
							for (const id of Array.from(Module.FolderStore.getExpandedFolders()).slice(1)) {
								Module.ClientActions.toggleGuildFolderExpand(id);
							}
						}

						props.update({
							closeOnOpen: enabled
						});
					}
				},
				"Close On Open"
			);
	}

	start() {
		this.injectCSS(Styles);
		this.createPatch(Component.GuildFolder.prototype, "render", {
			after: (d) => {
				const id = d.thisObject.props.folderId;

				if (Folders[id]) {
					const icon = qReact(d.returnValue, (e) => e.props.children.type.displayName === "FolderIcon");

					if (icon) {
						if (!Component.FolderIcon) {
							Component.FolderIcon = icon.props.children.type;
						}

						const iconProps = icon.props.children.props;
						iconProps.folderId = id;
						icon.props.children = React.createElement(BetterFolderIcon, iconProps);
					}
				}
			}
		});
		this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {
			after: (data) => {
				const context = data.thisObject;
				const id = context.props.folderId;

				if (!context.state.iconType) {
					context.state.iconType = Folders[id] ? "custom" : "default";
				}

				if (!context.state.icon) {
					context.state.icon = Folders[id];
				}

				const children = qReact(data.returnValue, (e) => e.type === "form").props.children;
				children.push(
					React.createElement(
						Component.FormItem,
						{
							title: "Icon",
							className: children[0].props.className
						},
						React.createElement(Component.RadioGroup, {
							value: context.state.iconType,
							options: [
								{
									name: React.createElement(
										Component.Flex,
										{
											align: Selector.flex.alignCenter
										},
										React.createElement(Component.Icon, {
											className: Selector.modal.icon,
											name: "Folder"
										}),
										"Default Icon"
									),
									value: "default"
								},
								{
									name: React.createElement(
										Component.Flex,
										{
											align: Selector.flex.alignCenter
										},
										React.createElement(Component.Icon, {
											className: Selector.modal.icon,
											name: "Nova_Help"
										}),
										"Custom Icon"
									),
									value: "custom"
								}
							],
							onChange: (e) => {
								context.setState({
									iconType: e.value
								});
							}
						})
					)
				);
				const button = qReact(data.returnValue, (e) => e.props.type === "submit");
				BdApi.monkeyPatch(button.props, "onClick", {
					silent: true,
					after: (d) => {
						if (context.state.iconType !== "default" && context.state.icon) {
							Folders[id] = context.state.icon;
						} else if (Object.keys(Folders).indexOf(id.toString()) > -1) {
							delete Folders[id];
						}

						BdApi.saveData("BetterFolders", "folders", Folders);
						this.forceUpdate(`.${Selector.folder.wrapper}`);
					}
				});

				if (context.state.iconType !== "default") {
					children.push(
						React.createElement(
							Component.FormItem,
							{
								title: "Custom Icon",
								className: children[0].props.className
							},
							React.createElement(BetterFolderUploader, {
								icon: context.state.icon,
								onChange: (e) =>
									context.setState({
										icon: e.icon
									})
							})
						)
					);
				}
			}
		});
		this.createPatch(Module.ClientActions, "toggleGuildFolderExpand", {
			name: "ClientActions",
			after: (data) => {
				if (this.settings.closeOnOpen) {
					const target = data.methodArguments[0];

					for (const id of Module.FolderStore.getExpandedFolders()) {
						id !== target && data.originalMethod(id);
					}
				}
			}
		});
		this.forceUpdate(Selector.folder.wrapper);
	}

	stop() {
		this.forceUpdate(Selector.folder.wrapper);
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "BetterFolders";
	}

	getVersion() {
		return "1.0.0";
	}

	getAuthor() {
		return "Zerthox";
	}

	getDescription() {
		return "Add new functionality to server folders.";
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
			FormSection = BdApi.findModuleByDisplayName("FormSection"),
			FormTitle = BdApi.findModuleByDisplayName("FormTitle"),
			FormDivider = BdApi.findModuleByDisplayName("FormDivider"),
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
					FormSection,
					null,
					React.createElement(
						FormTitle,
						{
							tag: "h2"
						},
						this.props.name,
						" Settings"
					),
					React.createElement(SettingsPanel, props),
					React.createElement(FormDivider, {
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
