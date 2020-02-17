/**
 * @name Emulator
 * @author Zerthox
 * @version 1.1.0
 * @description Emulate Windows, MacOS, Linux or Browser on any platform.\nWARNING: Emulating a different platform may cause unwanted side effects. Use at own risk.
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
	LayerStore: BdApi.findModuleByProps("getLayers"),
	LayerManager: BdApi.findModuleByProps("pushLayer", "popLayer"),
	Platform: BdApi.findModuleByProps("getPlatform", "isWindows", "isOSX", "isLinux", "isWeb", "PlatformTypes"),
	Overlay: BdApi.findModuleByProps("initialize", "isSupported", "getFocusedPID"),
	AppearanceStore: BdApi.findModuleByProps("keyboardModeEnabled"),
	AppearanceManager: BdApi.findModuleByProps("enableKeyboardMode")
};
const Component = {
	RadioGroup: BdApi.findModuleByDisplayName("RadioGroup")
};

class Plugin {
	constructor() {
		this.defaults = {
			platform: /^win/.test(Module.Platform.platform)
				? Module.Platform.PlatformTypes.WINDOWS
				: Module.Platform.platform === "darwin"
				? Module.Platform.PlatformTypes.OSX
				: Module.Platform.platform === "linux"
				? Module.Platform.PlatformTypes.LINUX
				: Module.Platform.PlatformTypes.WEB
		};
	}

	getSettings() {
		return (props) => {
			return React.createElement(Component.RadioGroup, {
				value: props.platform,
				onChange: (e) =>
					props.update({
						platform: e.value
					}),
				options: [
					{
						value: Module.Platform.PlatformTypes.WINDOWS,
						name: "Windows"
					},
					{
						value: Module.Platform.PlatformTypes.OSX,
						name: "MacOS"
					},
					{
						value: Module.Platform.PlatformTypes.LINUX,
						name: "Linux"
					},
					{
						value: Module.Platform.PlatformTypes.WEB,
						name: "Browser"
					}
				]
			});
		};
	}

	async update() {
		await this.forceUpdateRoot();
		this.toast(
			`Emulating ${
				Module.Platform.isWindows()
					? "Windows"
					: Module.Platform.isOSX()
					? "MacOS"
					: Module.Platform.isLinux()
					? "Linux"
					: "Browser"
			}`,
			{
				type: "info",
				timeout: 5000
			}
		);
	}

	toast(msg, opt) {
		this.log(msg);
		BdApi.showToast(msg, opt);
	}

	start() {
		for (const platform of ["Windows", "OSX", "Linux", "Web"]) {
			this.createPatch(Module.Platform, `is${platform}`, {
				name: "Platform",
				instead: () => this.settings.platform === Module.Platform.PlatformTypes[platform.toUpperCase()]
			});
		}

		this.createPatch(Module.Overlay, "isSupported", {
			name: "Overlay",
			instead: () => Module.Platform.isWindows()
		});
		this.update();
	}

	stop() {
		this.forceUpdateRoot();
		this.toast(`Stopped Emulating`, {
			type: "info",
			timeout: 5000
		});
	}

	async forceUpdateRoot() {
		try {
			let fiber = document.querySelector("#app-mount")._reactRootContainer._internalRoot.current;

			while (!(fiber.type && fiber.type.displayName === "App")) {
				fiber = fiber.child;
			}

			fiber.stateNode.forceUpdate();

			if (Module.AppearanceStore.keyboardModeEnabled) {
				Module.AppearanceManager.disableKeyboardMode();
				Module.AppearanceManager.enableKeyboardMode();
			} else {
				Module.AppearanceManager.enableKeyboardMode();
				Module.AppearanceManager.disableKeyboardMode();
			}

			if (Module.LayerStore.getLayers().includes("USER_SETTINGS")) {
				Module.LayerManager.popLayer();
			}
		} catch (e) {
			this.warn("Failed to force update app");
			console.error(e);
		}
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "Emulator";
	}

	getVersion() {
		return "1.1.0";
	}

	getAuthor() {
		return "Zerthox";
	}

	getDescription() {
		return "Emulate Windows, MacOS, Linux or Browser on any platform.\nWARNING: Emulating a different platform may cause unwanted side effects. Use at own risk.";
	}

	log(...msgs) {
		console.log(
			`%c[${this.getName()}] %c(v${this.getVersion()})`,
			"color: #3a71c1; font-weight: 700;",
			"color: #666; font-size: .8em;",
			...msgs
		);
	}

	warn(...msgs) {
		console.warn(
			`%c[${this.getName()}] %c(v${this.getVersion()})`,
			"color: #3a71c1; font-weight: 700;",
			"color: #666; font-size: .8em;",
			...msgs
		);
	}

	error(...msgs) {
		console.error(
			`%c[${this.getName()}] %c(v${this.getVersion()})`,
			"color: #3a71c1; font-weight: 700;",
			"color: #666; font-size: .8em;",
			...msgs
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
		this.forceUpdateElements(...classes.map((e) => Array.from(document.getElementsByClassName(e))).flat());
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
				this.warn(
					`Failed to force update "${
						el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName
					}" state node`
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
