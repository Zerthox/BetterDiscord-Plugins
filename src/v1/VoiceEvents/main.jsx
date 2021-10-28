/**
 * VoiceEvents plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
    Events: BdApi.findModuleByProps("dispatch", "subscribe"),
    Channels: BdApi.findModuleByProps("getChannel", "hasChannel"),
    SelectedChannel: BdApi.findModuleByProps("getChannelId", "getVoiceChannelId"),
    VoiceStates: BdApi.findModuleByProps("getVoiceStates", "hasVideo"),
    Users: BdApi.findModuleByProps("getUser", "getCurrentUser"),
    Members: BdApi.findModuleByProps("getMember", "isMember")
};

/** Component storage */
const Component = {
    Flex: BdApi.findModuleByDisplayName("Flex"),
    Text: BdApi.findModuleByDisplayName("Text"),
    VerticalScroller: BdApi.findModuleByDisplayName("VerticalScroller"),
    Button: BdApi.findModuleByProps("Link", "Hovers"),
    Form: BdApi.findModuleByProps("FormSection", "FormText"),
    SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
    TextInput: BdApi.findModuleByDisplayName("TextInput"),
    SelectTempWrapper: BdApi.findModuleByDisplayName("SelectTempWrapper"),
    Slider: BdApi.findModuleByDisplayName("Slider"),
    Menu: BdApi.findModuleByProps("MenuGroup", "MenuItem", "MenuSeparator"),
    VoiceContextMenu: BdApi.findModule((m) => m.default && m.default.displayName === "ChannelListVoiceChannelContextMenu")
};

/** Selector storage */
const Selector = {
    margins: BdApi.findModuleByProps("marginLarge")
};

// eslint-disable-next-line no-unused-vars
class Plugin {
    constructor() {
        this.callback = this.onChange.bind(this);
        this.defaults = {
            voice: null,
            volume: 100,
            speed: 1,
            filterNames: true,
            filterBots: false,
            filterStages: true,
            join: "$user joined $channel",
            leave: "$user left $channel",
            joinSelf: "You joined $channel",
            moveSelf: "You were moved to $channel",
            leaveSelf: "You left $channel",
            privateCall: "The call"
        };

        const voice = this.findDefaultVoice();
        this.defaults.voice = voice ? voice.voiceURI : null;
    }

    findDefaultVoice() {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            this.error("No speech synthesis voices available");
            const {Text} = Component;
            BdApi.alert(
                `${this.getName()}`,
                <Text color={Text.Colors.STANDARD}>
                    Electron does not have any Speech Synthesis Voices available on your system.
                    <br/>
                    The plugin will be unable to function properly.
                </Text>
            );
            return null;
        } else {
            return (voices.find((voice) => voice.lang === "en-US") || voices[0]);
        }
    }

    findCurrentVoice() {
        let voice = speechSynthesis.getVoices().find((el) => el.voiceURI === this.settings.voice);
        if (!voice) {
            this.warn(`Voice "${this.settings.voice}" could not be found, reverting to default`);
            voice = this.findDefaultVoice();
            this.settings.voice = voice.voiceURI;
            this.saveData("settings", this.settings);
        }
        return voice;
    }

    getSettings() {
        const self = this;
        const {Flex, Text, Button, SwitchItem, TextInput, SelectTempWrapper, Slider} = Component;
        const {FormSection, FormTitle, FormItem, FormText, FormDivider} = Component.Form;

        const voice = this.findCurrentVoice().voiceURI;

        return class SettingsPanel extends React.Component {
            render() {
                return (
                    <>
                        <FormItem className={Selector.margins.marginBottom20}>
                            <FormTitle>TTS Voice</FormTitle>
                            <SelectTempWrapper
                                value={voice}
                                searchable={false}
                                clearable={false}
                                onChange={(el) => this.props.update({voice: el.value})}
                                options={speechSynthesis.getVoices().map(({name, lang, voiceURI}) => ({
                                    label: (
                                        <Flex>
                                            <Text style={{marginRight: 4}}>{name}</Text>
                                            <Text color={Text.Colors.MUTED}>[{lang}]</Text>
                                        </Flex>
                                    ),
                                    value: voiceURI
                                }))}
                            />
                        </FormItem>
                        <FormItem className={Selector.margins.marginBottom20}>
                            <FormTitle>TTS Volume</FormTitle>
                            <Slider
                                initialValue={this.props.volume}
                                maxValue={100}
                                minValue={0}
                                asValueChanges={(value) => this.props.update({volume: value})}
                            />
                        </FormItem>
                        <FormItem className={Selector.margins.marginBottom20}>
                            <FormTitle>TTS Speed</FormTitle>
                            <Slider
                                initialValue={this.props.speed}
                                maxValue={10}
                                minValue={0.1}
                                asValueChanges={(value) => this.props.update({speed: value})}
                                onValueRender={(value) => `${value.toFixed(2)}x`}
                                markers={[0.1, 1, 2, 5, 10]}
                                onMarkerRender={(value) => `${value.toFixed(2)}x`}
                            />
                        </FormItem>
                        <FormDivider className={[Selector.margins.marginTop20, Selector.margins.marginBottom20].join(" ")}/>
                        <FormItem>
                            <SwitchItem
                                value={this.props.filterNames}
                                onChange={(checked) => this.props.update({filterNames: checked})}
                                note="Limit user & channel names to alphanumeric characters."
                            >Enable Name Filter</SwitchItem>
                        </FormItem>
                        <FormItem>
                            <SwitchItem
                                value={this.props.filterBots}
                                onChange={(checked) => this.props.update({filterBots: checked})}
                                note="Disable notifications for bot users in voice."
                            >Enable Bot Filter</SwitchItem>
                        </FormItem>
                        <FormItem>
                            <SwitchItem
                                value={this.props.filterStages}
                                onChange={(checked) => this.props.update({filterStages: checked})}
                                note="Disable notifications for stage voice channels."
                            >Enable Stage Filter</SwitchItem>
                        </FormItem>
                        <FormSection>
                            <FormTitle tag="h3">Messages</FormTitle>
                            <FormText type="description" className={Selector.margins.marginBottom20}>
                                $user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.
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
                return values.map(({title, setting}, i) => (
                    <FormItem key={i} className={Selector.margins.marginBottom20}>
                        <FormTitle>{title}</FormTitle>
                        <Flex align={Flex.Align.CENTER}>
                            <div style={{flexGrow: 1, marginRight: 20}}>
                                <TextInput
                                    onChange={(e) => this.props.update({[setting]: e})}
                                    value={this.props[setting]}
                                    placeholder={self.defaults[setting]}
                                />
                            </div>
                            <Button
                                size={Button.Sizes.SMALL}
                                onClick={() => self.speak(
                                    self.settings[setting]
                                        .split("$user").join("user")
                                        .split("$username").join("username")
                                        .split("$channel").join("channel")
                                )}
                            >Test</Button>
                        </Flex>

                    </FormItem>
                ));
            }
        };
    }

    start() {
        this.cloneStates();
        Module.Events.subscribe("VOICE_STATE_UPDATES", this.callback);

        // add queue clear item to context menu
        const {MenuGroup, MenuItem} = Component.Menu;
        this.createPatch(Component.VoiceContextMenu, "default", {after: ({returnValue}) => {
            const {children} = returnValue.props;

            // find delete channel index
            const index = children.findIndex((node) => node && [node.props.children].flat().find((child) => child && child.props.id === "delete-channel"));

            // insert new item
            children.splice(index, 0,
                <MenuGroup>
                    <MenuItem
                        isFocused={false}
                        id="voiceevents-clear"
                        label="Clear Notification queue"
                        action={() => speechSynthesis.cancel()}
                    />
                </MenuGroup>
            );

            // return modified return value
            return returnValue;
        }});
    }

    stop() {
        this.states = {};
        Module.Events.unsubscribe("VOICE_STATE_UPDATES", this.callback);
    }

    cloneStates() {
        const {SelectedChannel, VoiceStates} = Module;
        this.states = {...VoiceStates.getVoiceStatesForChannel(SelectedChannel.getVoiceChannelId())};
    }

    onChange(event) {
        for (const state of event.voiceStates) {
            this.processStateUpdate(state);
        }
    }

    processStateUpdate(state) {
        try {
            const {Users, SelectedChannel, VoiceStates} = Module;
            const {userId, channelId} = state;
            const prev = this.states[userId];

            // check for self
            if (userId === Users.getCurrentUser().id) {
                if (!channelId) {
                    // no channel is leave
                    this.notify({type: "leaveSelf", userId, channelId: prev.channelId});
                    this.cloneStates();
                } else if (!prev) {
                    // no previous state is join
                    this.notify({type: "joinSelf", userId, channelId});
                    this.cloneStates();
                } else if (prev.channelId !== channelId) {
                    // previous state in different channel is move
                    this.notify({type: "moveSelf", userId, channelId});
                    this.cloneStates();
                }
            } else {
                const selectedChannelId = SelectedChannel.getVoiceChannelId();
                if (selectedChannelId) {
                    if (!prev && channelId === selectedChannelId) {
                        // no previous state & same channel is join
                        this.notify({type: "join", userId, channelId});
                        this.cloneStates();
                    } else if (prev && !VoiceStates.getVoiceStatesForChannel(selectedChannelId)[userId]) {
                        // previous state & no current state is leave
                        this.notify({type: "leave", userId, channelId: selectedChannelId});
                        this.cloneStates();
                    }
                }
            }
        } catch (err) {
            this.error("Error processing voice state change, see details below");
            console.error(err);
        }
    }

    processName(name) {
        return this.settings.filterNames ? name.split("").map((char) => /[a-zA-Z0-9]/.test(char) ? char : " ").join("") : name;
    }

    notify({type, userId, channelId}) {
        const {Channels, Users, Members} = Module;
        const channel = Channels.getChannel(channelId);
        const isDM = channel.isDM() || channel.isGroupDM();
        const user = Users.getUser(userId);

        // check for bot filter
        if (this.settings.filterBots && user.bot) {
            return;
        }

        // check for stage filter
        if (this.settings.filterStages && channel.isGuildStageVoice()) {
            return;
        }

        // find nick & channel name
        const nick = (!isDM && Members.getMember(channel.getGuildId(), userId).nick) || user.username;
        const channelName = isDM ? this.settings.privateCall : channel.name;

        // speak message
        const msg = this.settings[type]
            .split("$username").join(this.processName(user.username))
            .split("$user").join(this.processName(nick))
            .split("$channel").join(this.processName(channelName));
        this.speak(msg);
    }

    speak(msg) {
        // create utterance
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.voice = this.findCurrentVoice();
        utterance.volume = this.settings.volume / 100;
        utterance.rate = this.settings.speed;

        // speak utterance
        speechSynthesis.speak(utterance);
    }
}
