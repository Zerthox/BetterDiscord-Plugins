/**
 * @name VoiceEvents
 * @author Zerthox
 * @version 1.1.2
 * @description Add TTS Event Notifications to your selected Voice Channel. Teamspeak feeling.
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
	Events: BdApi.findModuleByProps("dispatch", "subscribe"),
	Channels: BdApi.findModuleByProps("getChannel"),
	SelectedChannel: BdApi.findModuleByProps("getChannelId"),
	VoiceStates: BdApi.findModuleByProps("getVoiceStates"),
	Users: BdApi.findModuleByProps("getUser")
};
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	Text: BdApi.findModuleByDisplayName("Text"),
	VerticalScroller: BdApi.findModuleByDisplayName("VerticalScroller"),
	Button: BdApi.findModuleByProps("Link", "Hovers"),
	Form: BdApi.findModuleByProps("FormSection", "FormText"),
	TextInput: BdApi.findModuleByDisplayName("TextInput"),
	SelectTempWrapper: BdApi.findModuleByDisplayName("SelectTempWrapper")
};
const Selector = {
	margins: BdApi.findModuleByProps("marginLarge")
};

function cloneStates(channel) {
	return Module.VoiceStates.getVoiceStatesForChannel(channel).slice(0);
}

function isDM(channel) {
	return channel.isDM() || channel.isGroupDM();
}

class Plugin {
	constructor() {
		this.callback = this.onChange.bind(this);
		this.defaults = {
			voice: null,
			join: "$user joined $channel",
			leave: "$user left $channel",
			joinSelf: "You joined $channel",
			moveSelf: "You were moved to $channel",
			leaveSelf: "You left $channel",
			privateCall: "The call"
		};
		const voices = speechSynthesis.getVoices();

		if (voices.length === 0) {
			this.error("Unable to find any speech synthesis voices");
			const {Text} = Component;
			BdApi.alert(
				`${this.getName()}`,
				React.createElement(
					Text,
					{
						color: Text.Colors.STANDARD
					},
					"Electron does not have any Speech Synthesis Voices available on your system.",
					React.createElement("br", null),
					"The plugin will be unable to function properly."
				)
			);
		} else {
			this.defaults.voice = (voices.find((voice) => voice.lang === "en-US") || voices[0]).name;
		}
	}

	getSettings() {
		const self = this,
			{SelectTempWrapper, TextInput} = Component,
			{FormSection, FormTitle, FormItem, FormText, FormDivider} = Component.Form;
		return class SettingsPanel extends React.Component {
			render() {
				return React.createElement(
					React.Fragment,
					null,
					React.createElement(
						FormItem,
						null,
						React.createElement(FormTitle, null, "TTS Voice"),
						React.createElement(SelectTempWrapper, {
							value: this.props.voice,
							searchable: false,
							clearable: false,
							onChange: (e) =>
								this.props.update({
									voice: e.value
								}),
							options: speechSynthesis.getVoices().map((voice) => ({
								label: `${voice.name} [${voice.lang}]`,
								value: voice.name
							}))
						})
					),
					React.createElement(FormDivider, {
						className: [Selector.margins.marginTop20, Selector.margins.marginBottom20].join(" ")
					}),
					React.createElement(
						FormSection,
						null,
						React.createElement(
							FormTitle,
							{
								tag: "h3"
							},
							"Messages"
						),
						React.createElement(
							FormText,
							{
								type: "description",
								className: Selector.margins.marginBottom20
							},
							"$user will get replaced with the respective Username and $channel with the respective Voice Channel name."
						),
						this.generateInputs([
							{
								title: "Join Message (Other Users)",
								setting: "join"
							},
							{
								title: "Leave Message (Other Users)",
								setting: "leave"
							},
							{
								title: "Join Message (Self)",
								setting: "joinSelf"
							},
							{
								title: "Move Message (Self)",
								setting: "moveSelf"
							},
							{
								title: "Leave Message (Self)",
								setting: "leaveSelf"
							},
							{
								title: "Private Call channel name",
								setting: "privateCall"
							}
						])
					)
				);
			}

			generateInputs(values) {
				return values.map((value) =>
					React.createElement(
						FormItem,
						{
							className: Selector.margins.marginBottom20
						},
						React.createElement(FormTitle, null, value.title),
						React.createElement(TextInput, {
							onChange: (e) =>
								this.props.update({
									[value.setting]: e
								}),
							value: this.props[value.setting],
							placeholder: self.defaults[value.setting]
						})
					)
				);
			}
		};
	}

	start() {
		this.states = cloneStates(Module.Channels.getChannel(Module.SelectedChannel.getVoiceChannelId()));
		Module.Events.subscribe("VOICE_STATE_UPDATE", this.callback);
	}

	stop() {
		this.states = [];
		Module.Events.unsubscribe("VOICE_STATE_UPDATE", this.callback);
	}

	onChange(event) {
		const {Channels, Users, SelectedChannel} = Module;

		if (event.userId === Users.getCurrentUser().id) {
			if (!event.channelId) {
				const channel = Channels.getChannel(this.states[0].channelId);
				this.speak({
					type: "leaveSelf",
					user: Users.getCurrentUser().username,
					channel: isDM(channel) ? this.settings.privateCall : channel.name
				});
			} else {
				const channel = Channels.getChannel(event.channelId);

				if (!isDM(channel) && this.states.length > 0 && this.states[0].channelId !== event.channelId) {
					this.speak({
						type: "moveSelf",
						user: Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				} else if (this.states.length === 0) {
					this.speak({
						type: "joinSelf",
						user: Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				}
			}

			this.states = cloneStates(Channels.getChannel(event.channelId));
		} else {
			const channel = Channels.getChannel(SelectedChannel.getVoiceChannelId());

			if (channel) {
				const prev = this.states.find((user) => user.userId === event.userId);

				if (event.channelId === channel.id && !prev) {
					this.speak({
						type: "join",
						user: Users.getUser(event.userId).username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
					this.states = cloneStates(channel);
				} else if (!event.channelId && prev) {
					this.speak({
						type: "leave",
						user: Users.getUser(event.userId).username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
					this.states = cloneStates(channel);
				}
			}
		}
	}

	speak(data) {
		const voices = speechSynthesis.getVoices();
		const message = this.settings[data.type]
			.split("$user")
			.join(data.user)
			.split("$channel")
			.join(data.channel);

		if (voices.length === 0) {
			this.error(`${message} could not be played: No speech synthesis voices available`);
			return;
		}

		const utterance = new SpeechSynthesisUtterance(message);
		utterance.voice = voices.find((e) => e.name === this.settings.voice);
		speechSynthesis.speak(utterance);
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "VoiceEvents";
	}

	getVersion() {
		return "1.1.2";
	}

	getAuthor() {
		return "Zerthox";
	}

	getDescription() {
		return "Add TTS Event Notifications to your selected Voice Channel. Teamspeak feeling.";
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
