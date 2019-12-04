/**
 * @name BetterFolders
 * @author Zerthox
 * @version 2.0.3
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
	Dispatcher: BdApi.findModuleByProps("Dispatcher").Dispatcher,
	ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
	FolderStore: BdApi.findModuleByProps("getExpandedFolders")
};
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	GuildFolder: BdApi.findModuleByDisplayName("GuildFolder"),
	GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
	Icon: BdApi.findModuleByDisplayName("Icon"),
	Form: BdApi.findModuleByProps("FormSection", "FormText"),
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
	button: BdApi.findModuleByProps("colorWhite"),
	margins: BdApi.findModuleByProps("marginLarge")
};
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

const BetterFolderStore = (() => {
	const Folders = BdApi.loadData("BetterFolders", "folders") || {};
	let changed = false;

	for (const [id, value] of Object.entries(Folders)) {
		if (typeof value === "string") {
			Folders[id] = {
				icon: value,
				always: false
			};
			changed = true;
		}
	}

	if (changed) {
		BdApi.saveData("BetterFolders", "folders", Folders);
	}

	const FoldersDispatcher = new Module.Dispatcher();

	class BetterFolderStore extends Flux.Store {
		setFolder(id, data) {
			if (!Folders[id]) {
				Folders[id] = {};
			}

			Object.assign(Folders[id], data);
			FoldersDispatcher.dirtyDispatch({
				type: "update",
				folderId: id,
				data
			});
			BdApi.saveData("BetterFolders", "folders", Folders);
		}

		getFolder(id) {
			return Folders[id];
		}

		deleteFolder(id) {
			delete Folders[id];
			FoldersDispatcher.dirtyDispatch({
				type: "delete",
				folderId: id
			});
			BdApi.saveData("BetterFolders", "folders", Folders);
		}
	}

	return new BetterFolderStore(FoldersDispatcher, {
		update: () => {},
		delete: () => {}
	});
})();

function BetterFolderIcon({expanded, icon, always, childProps}) {
	const result = Component.FolderIcon.call(this, childProps);

	if (icon) {
		if (expanded) {
			const Icon = qReact(result, (e) => e.props.children.type.displayName === "Icon");

			if (Icon) {
				Icon.props.children = React.createElement("div", {
					className: "betterFolders-customIcon",
					style: {
						backgroundImage: `url(${icon}`
					}
				});
			}
		} else if (always) {
			result.props.children = React.createElement("div", {
				className: "betterFolders-customIcon",
				style: {
					backgroundImage: `url(${icon}`
				}
			});
		}
	}

	return result;
}

const BetterFolderIconContainer = Flux.connectStores([BetterFolderStore], ({childProps: {expanded, folderId}}) =>
	Object.assign(
		{
			expanded
		},
		BetterFolderStore.getFolder(folderId)
	)
)(BetterFolderIcon);

class BetterFolderUploader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			icon: props.icon,
			always: props.always
		};
	}

	setState(state) {
		super.setState(state, () => {
			this.props.onChange && this.props.onChange(this.state);
		});
	}

	render() {
		const {
			Flex,
			Button,
			ImageInput,
			SwitchItem,
			Form: {FormText}
		} = Component;
		return React.createElement(
			React.Fragment,
			null,
			React.createElement(
				Flex,
				{
					align: Selector.flex.alignCenter
				},
				React.createElement(
					Button,
					{
						color: Selector.button.colorWhite,
						look: Selector.button.lookOutlined
					},
					"Upload Image",
					React.createElement(ImageInput, {
						onChange: (e) => {
							this.setState({
								icon: e
							});
						}
					})
				),
				React.createElement(
					FormText,
					{
						type: "description",
						style: {
							margin: "0 10px 0 40px"
						}
					},
					"Preview:"
				),
				React.createElement(BetterFolderIcon, {
					childProps: {
						color: this.props.color,
						guildIds: []
					},
					icon: this.state.icon,
					always: true
				})
			),
			React.createElement(
				Flex,
				null,
				React.createElement(
					SwitchItem,
					{
						hideBorder: true,
						className: Selector.margins.marginTop8,
						value: this.state.always,
						onChange: ({currentTarget: {checked}}) =>
							this.setState({
								always: checked
							})
					},
					"Always display icon"
				)
			)
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
					onChange: ({currentTarget: {checked}}) => {
						if (checked) {
							for (const id of Array.from(Module.FolderStore.getExpandedFolders()).slice(1)) {
								Module.ClientActions.toggleGuildFolderExpand(id);
							}
						}

						props.update({
							closeOnOpen: checked
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
				const icon = qReact(d.returnValue, (e) => e.props.children.type.displayName === "FolderIcon");

				if (icon) {
					if (!Component.FolderIcon) {
						Component.FolderIcon = icon.props.children.type;
					}

					const iconProps = icon.props.children.props;
					iconProps.folderId = id;
					icon.props.children = React.createElement(BetterFolderIconContainer, {
						childProps: iconProps
					});
				}
			}
		});
		this.forceUpdate(`.${Selector.folder.wrapper}`);
		this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {
			after: ({thisObject: context, returnValue}) => {
				const {
						Flex,
						Icon,
						RadioGroup,
						Form: {FormItem}
					} = Component,
					id = context.props.folderId;

				if (!context.state.iconType) {
					const folder = BetterFolderStore.getFolder(id);

					if (folder) {
						Object.assign(context.state, {
							iconType: "custom",
							icon: folder.icon,
							always: folder.always
						});
					} else {
						Object.assign(context.state, {
							iconType: "default",
							icon: null,
							always: false
						});
					}
				}

				const children = qReact(returnValue, (e) => e.type === "form").props.children;
				const {className} = children[0].props;
				children.push(
					React.createElement(
						FormItem,
						{
							title: "Icon",
							className: className
						},
						React.createElement(RadioGroup, {
							value: context.state.iconType,
							options: [
								{
									name: React.createElement(
										Flex,
										{
											align: Selector.flex.alignCenter
										},
										React.createElement(Icon, {
											className: Selector.modal.icon,
											name: "Folder"
										}),
										"Default Icon"
									),
									value: "default"
								},
								{
									name: React.createElement(
										Flex,
										{
											align: Selector.flex.alignCenter
										},
										React.createElement(Icon, {
											className: Selector.modal.icon,
											name: "Nova_Help"
										}),
										"Custom Icon"
									),
									value: "custom"
								}
							],
							onChange: ({value}) =>
								context.setState({
									iconType: value
								})
						})
					)
				);
				const button = qReact(returnValue, (e) => e.props.type === "submit");
				BdApi.monkeyPatch(button.props, "onClick", {
					silent: true,
					after: () => {
						if (context.state.iconType !== "default" && context.state.icon) {
							BetterFolderStore.setFolder(id, {
								icon: context.state.icon,
								always: context.state.always
							});
						} else if (Object.keys(Folders).indexOf(id.toString()) > -1) {
							BetterFolderStore.deleteFolder(id);
						}
					}
				});

				if (context.state.iconType !== "default") {
					children.push(
						React.createElement(
							FormItem,
							{
								title: "Custom Icon",
								className: className
							},
							React.createElement(BetterFolderUploader, {
								color: context.state.color,
								icon: context.state.icon,
								always: context.state.always,
								onChange: (data) =>
									context.setState({
										icon: data.icon,
										always: data.always
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
		return "2.0.3";
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
					update: (state) => {
						this.saveData("settings", Object.assign(this.settings, state));
						this.update && this.update();
					},
					reset: () => {
						this.saveData("settings", Object.assign(this.settings, this.defaults));
						this.update && this.update();
					}
				}),
				this._settingsRoot
			);
		}

		return this._settingsRoot;
	};
}

/*@end@*/
