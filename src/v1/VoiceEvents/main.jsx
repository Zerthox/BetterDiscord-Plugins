/**
 * VoiceEvents plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Events: BdApi.findModuleByProps("dispatch", "subscribe"),
	SelectedGuild: BdApi.findModuleByProps("getGuildId"),
	Channels: BdApi.findModuleByProps("getChannel"),
	SelectedChannel: BdApi.findModuleByProps("getChannelId"),
	VoiceStates: BdApi.findModuleByProps("getVoiceStates"),
	Users: BdApi.findModuleByProps("getUser")
};

/** Component storage */
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	VerticalScroller: BdApi.findModuleByDisplayName("VerticalScroller"),
	Button: BdApi.findModuleByProps("Link", "Hovers"),
	FormSection: BdApi.findModuleByDisplayName("FormSection"),
	FormItem: BdApi.findModuleByDisplayName("FormItem"),
	FormDivider: BdApi.findModuleByDisplayName("FormDivider"),
	FormTitle: BdApi.findModuleByDisplayName("FormTitle"),
	FormText: BdApi.findModuleByDisplayName("FormText"),
	TextInput: BdApi.findModuleByDisplayName("TextInput"),
	SelectTempWrapper: BdApi.findModuleByDisplayName("SelectTempWrapper")
};

/** Selector storage */
const Selector = {
	margins: BdApi.findModuleByProps("marginLarge")
};

function cloneStates(guild, channel) {
	return Module.VoiceStates.getVoiceStatesForChannel(guild, channel).slice(0);
}

function isDM(channel) {
	return channel.type === 1 || channel.type === 3;
}

class Plugin {

	constructor() {
		this.defaults = {
			voice: speechSynthesis.getVoices().find((e) => e.lang === "en-US").name || speechSynthesis.getVoices()[0].name,
			join: "$user joined $channel",
			leave: "$user left $channel",
			joinSelf: "You joined $channel",
			moveSelf: "You were moved to $channel",
			leaveSelf: "You left $channel",
			privateCall: "The call"
		};
		this.callback = this.onChange.bind(this);
	}

	getSettings() {
		const self = this;

		return class SettingsPanel extends React.Component {

			render() {
				return (
					<>
						<Component.FormItem>
							<Component.FormTitle>TTS Voice</Component.FormTitle>
							<Component.SelectTempWrapper
								value={this.props.voice}
								searchable={false}
								clearable={false}
								onChange={(e) => this.props.update({voice: e.value})}
								options={speechSynthesis.getVoices().map((e) => ({label: `${e.name} [${e.lang}]`, value: e.name}))}
							/>
						</Component.FormItem>
						<Component.FormDivider className={[Selector.margins.marginTop20, Selector.margins.marginBottom20].join(" ")}/>
						<Component.FormSection>
							<Component.FormTitle tag="h3">Messages</Component.FormTitle>
							<Component.FormText type="description" className={Selector.margins.marginBottom20}>
								$user will get replaced with the respective Username and $channel with the respective Voice Channel name.
							</Component.FormText>
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
						</Component.FormSection>
					</>
				);
			}

			generateInputs(values) {
				return values.map((val) => (
					<Component.FormItem className={Selector.margins.marginBottom20}>
						<Component.FormTitle>{val.title}</Component.FormTitle>
						<Component.TextInput onChange={(e) => this.props.update({[val.setting]: e})} value={this.props[val.setting]} placeholder={self.defaults[val.setting]}/>
					</Component.FormItem>
				));
			}

		};
	}

	start() {
		this.states = cloneStates(Module.SelectedGuild.getGuildId(), Module.SelectedChannel.getVoiceChannelId());
		Module.Events.subscribe("VOICE_STATE_UPDATE", this.callback);
	}

	stop() {
		this.states = [];
		Module.Events.unsubscribe("VOICE_STATE_UPDATE", this.callback);
	}

	onChange(event) {
		if (event.userId === Module.Users.getCurrentUser().id) {
			if (!event.channelId) {
				const channel = Module.Channels.getChannel(this.states[0].channelId);
				this.speak({
						type: "leaveSelf",
						user: Module.Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
			}
			else {
				const channel = Module.Channels.getChannel(event.channelId);
				if (!isDM(channel) && this.states.length > 0 && this.states[0].channelId !== event.channelId) {
					this.speak({
						type: "moveSelf",
						user: Module.Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				}
				else if (this.states.length === 0) {
					this.speak({
						type: "joinSelf",
						user: Module.Users.getCurrentUser().username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
				}
			}
			this.states = cloneStates(event.guildId, event.channelId);
		}
		else {
			const selected = Module.SelectedChannel.getVoiceChannelId();
			if (selected) {
				const prev = this.states.find((u) => u.userId === event.userId);
				if (event.channelId === selected && !prev) {
					const channel = Module.Channels.getChannel(selected);
					this.speak({
						type: "join",
						user: Module.Users.getUser(event.userId).username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
					this.states = cloneStates(event.guildId, selected);
				}
				else if (!event.channelId && prev) {
					const channel = Module.Channels.getChannel(selected);
					this.speak({
						type: "leave",
						user: Module.Users.getUser(event.userId).username,
						channel: isDM(channel) ? this.settings.privateCall : channel.name
					});
					this.states = cloneStates(Module.SelectedGuild.getGuildId(), selected);
				}
			}
		}
	}

	speak(data) {
		const message = this.settings[data.type].split("$user").join(data.user).split("$channel").join(data.channel);
		const utterance = new SpeechSynthesisUtterance(message);
		utterance.voice = speechSynthesis.getVoices().find((e) => e.name === this.settings.voice);
		speechSynthesis.speak(utterance);
	}
}