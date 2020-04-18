/**
 * VoiceEvents plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Events: BdApi.findModuleByProps("dispatch", "subscribe"),
	Channels: BdApi.findModuleByProps("getChannel"),
	SelectedChannel: BdApi.findModuleByProps("getChannelId"),
	VoiceStates: BdApi.findModuleByProps("getVoiceStates"),
	Users: BdApi.findModuleByProps("getUser")
};

/** Component storage */
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	Text: BdApi.findModuleByDisplayName("Text"),
	VerticalScroller: BdApi.findModuleByDisplayName("VerticalScroller"),
	Button: BdApi.findModuleByProps("Link", "Hovers"),
	Form: BdApi.findModuleByProps("FormSection", "FormText"),
	TextInput: BdApi.findModuleByDisplayName("TextInput"),
	SelectTempWrapper: BdApi.findModuleByDisplayName("SelectTempWrapper")
};

/** Selector storage */
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
				<Text color={Text.Colors.STANDARD}>
					Electron does not have any Speech Synthesis Voices available on your system.
					<br/>
					The plugin will be unable to function properly.
				</Text>
			);
		}
		else {
			this.defaults.voice = (voices.find((voice) => voice.lang === "en-US") || voices[0]).name
		}
	}

	getSettings() {
		const self = this,
			{SelectTempWrapper, TextInput} = Component,
			{FormSection, FormTitle, FormItem, FormText, FormDivider} = Component.Form;

		return class SettingsPanel extends React.Component {

			render() {
				return (
					<>
						<FormItem>
							<FormTitle>TTS Voice</FormTitle>
							<SelectTempWrapper
								value={this.props.voice}
								searchable={false}
								clearable={false}
								onChange={(e) => this.props.update({voice: e.value})}
								options={speechSynthesis.getVoices().map((voice) => ({
									label: `${voice.name} [${voice.lang}]`,
									value: voice.name
								}))}
							/>
						</FormItem>
						<FormDivider className={[Selector.margins.marginTop20, Selector.margins.marginBottom20].join(" ")}/>
						<FormSection>
							<FormTitle tag="h3">Messages</FormTitle>
							<FormText type="description" className={Selector.margins.marginBottom20}>
								$user will get replaced with the respective Username and $channel with the respective Voice Channel name.
							</FormText>
							{this.generateInputs([
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
							])}
						</FormSection>
					</>
				);
			}

			generateInputs(values) {
				return values.map((value) => (
					<FormItem className={Selector.margins.marginBottom20}>
						<FormTitle>{value.title}</FormTitle>
						<TextInput
							onChange={(e) => this.props.update({[value.setting]: e})}
							value={this.props[value.setting]}
							placeholder={self.defaults[value.setting]}
						/>
					</FormItem>
				));
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
			}
			else {
				const channel = Channels.getChannel(event.channelId);
				if (!isDM(channel) && this.states.length > 0 && this.states[0].channelId !== event.channelId) {
					this.speak({
						type: "moveSelf",
						user: Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				}
				else if (this.states.length === 0) {
					this.speak({
						type: "joinSelf",
						user: Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				}
			}
			this.states = cloneStates(Channels.getChannel(event.channelId));
		}
		else {
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
				}
				else if (!event.channelId && prev) {
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
		const message = this.settings[data.type].split("$user").join(data.user).split("$channel").join(data.channel);
		if (voices.length === 0) {
			this.error(`${message} could not be played: No speech synthesis voices available`);
			return;
		}
		const utterance = new SpeechSynthesisUtterance(message);
		utterance.voice = voices.find((e) => e.name === this.settings.voice);
		speechSynthesis.speak(utterance);
	}
}