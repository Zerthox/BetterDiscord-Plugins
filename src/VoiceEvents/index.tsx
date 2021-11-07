import {createPlugin, Finder, Utils, React, classNames} from "discordium";
import config from "./config.json";

const Events = Finder.byProps("dispatch", "subscribe");
const Channels = Finder.byProps("getChannel", "hasChannel");
const SelectedChannel = Finder.byProps("getChannelId", "getVoiceChannelId");
const VoiceStates = Finder.byProps("getVoiceStates", "hasVideo");
const Users = Finder.byProps("getUser", "getCurrentUser");
const Members = Finder.byProps("getMember", "isMember");

const Flex = Finder.byName("Flex");
const Text = Finder.byName("Text");
const Button = Finder.byProps("Link", "Hovers");
const {FormSection, FormTitle, FormItem, FormText, FormDivider} = Finder.byProps("FormSection", "FormText") ?? {};
const SwitchItem = Finder.byName("SwitchItem");
const TextInput = Finder.byName("TextInput");
const SelectTempWrapper = Finder.byName("SelectTempWrapper");
const Slider = Finder.byName("Slider");
const {MenuGroup, MenuItem} = Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator") ?? {};
const VoiceContextMenu = Finder.query({name: "ChannelListVoiceChannelContextMenu", source: ["isGuildStageVoice"]});

const margins = Finder.byProps("marginLarge");

const settings = {
    voice: null as string,
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

type NotificationType = "join" | "leave" | "joinSelf" | "moveSelf" | "leaveSelf";

interface VoiceState {
    channelId: string;
    userId: string;
    sessionId: string;
    deaf: boolean;
    mute: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfVideo: boolean;
    selfStream: boolean;
    suppress: boolean;
    requestToSpeakTimestamp: any;
}

let prevStates: Record<string, VoiceState> = {};
const saveStates = () => {
    prevStates = {...VoiceStates.getVoiceStatesForChannel(SelectedChannel.getVoiceChannelId())};
};

export default createPlugin({...config, settings}, ({Logger, Patcher, Settings}) => {
    const findDefaultVoice = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            Logger.error("No speech synthesis voices available");
            Utils.alert(
                config.name,
                <Text color={Text.Colors.STANDARD}>
                    Electron does not have any Speech Synthesis Voices available on your system.
                    <br/>
                    The plugin will be unable to function properly.
                </Text>
            );
            return null;
        } else {
            return voices.find((voice) => voice.lang === "en-US") ?? voices[0];
        }
    };

    // update default voice
    Settings.defaults.voice = findDefaultVoice()?.voiceURI;
    if (Settings.get().voice === null) {
        Settings.set({voice: Settings.defaults.voice});
    }

    const findCurrentVoice = () => {
        const uri = Settings.get().voice;
        const voice = speechSynthesis.getVoices().find((voice) => voice.voiceURI === uri);
        if (voice) {
            return voice;
        } else {
            Logger.warn(`Voice "${uri}" not found, reverting to default`);
            const defaultVoice = findDefaultVoice();
            Settings.set({voice: defaultVoice.voiceURI});
            return defaultVoice;
        }
    };

    const speak = (message: string) => {
        const {volume, speed} = Settings.get();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = findCurrentVoice();
        utterance.volume = volume / 100;
        utterance.rate = speed;

        speechSynthesis.speak(utterance);
    };

    const processName = (name: string) => {
        return Settings.get().filterNames ? name.split("").map((char) => /[a-zA-Z0-9]/.test(char) ? char : " ").join("") : name;
    };

    const notify = (type: NotificationType, userId: string, channelId: string) => {
        const settings = Settings.get();
        const user = Users.getUser(userId);
        const channel = Channels.getChannel(channelId);
        const isDM = channel.isDM() || channel.isGroupDM();

        // check for filters
        if (
            settings.filterBots && user.bot
            || settings.filterStages && channel.isGuildStageVoice()
        ) {
            return;
        }

        // resolve names
        const nick = Members.getMember(channel.getGuildId(), userId)?.nick ?? user.username;
        const channelName = isDM ? settings.privateCall : channel.name;

        // speak message
        speak(settings[type]
            .split("$username").join(processName(user.username))
            .split("$user").join(processName(nick))
            .split("$channel").join(processName(channelName))
        );
    };

    const listener = (event) => {
        for (const {userId, channelId} of event.voiceStates as VoiceState[]) {
            try {
                const prev = prevStates[userId];

                if (userId === Users.getCurrentUser().id) {
                    // user is self
                    if (!channelId) {
                        // no channel is leave
                        notify("leaveSelf", userId, prev.channelId);
                        saveStates();
                    } else if (!prev) {
                        // no previous state is join
                        notify("joinSelf", userId, channelId);
                        saveStates();
                    } else if (channelId !== prev.channelId) {
                        // previous state in different channel is move
                        notify("moveSelf", userId, channelId);
                        saveStates();
                    }
                } else {
                    // check for current channel
                    const selectedChannelId = SelectedChannel.getVoiceChannelId();
                    if (!selectedChannelId) {
                        // user is not in voice
                        return;
                    }

                    if (!prev && channelId === selectedChannelId) {
                        // no previous state & same channel is join
                        notify("join", userId, channelId);
                        saveStates();
                    } else if (prev && !VoiceStates.getVoiceStatesForChannel(selectedChannelId)[userId]) {
                        // previous state & no current state is leave
                        notify("leave", userId, selectedChannelId);
                        saveStates();
                    }
                }
            } catch (error) {
                Logger.error("Error processing voice state change, see details below");
                console.error(error);
            }
        }
    };

    return {
        start() {
            // save initial voice states
            saveStates();

            // listen for updates
            Events.subscribe("VOICE_STATE_UPDATES", listener);

            // add queue clear item to context menu
            Patcher.after(VoiceContextMenu as {default: (props: any) => JSX.Element}, "default", ({result}) => {
                const {children} = result.props;

                // insert after delete channel
                const index = children.findIndex((node) => [node?.props.children].flat()
                    .find((child) => child?.props.id === "delete-channel")
                );
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

                return result;
            });
        },
        stop() {
            // reset
            prevStates = {};
            Events.unsubscribe("VOICE_STATE_UPDATES", listener);
        },
        settingsPanel: ({voice, volume, speed, filterNames, filterBots, filterStages, ...settings}) => (
            <>
                <FormItem className={margins.marginBottom20}>
                    <FormTitle>TTS Voice</FormTitle>
                    <SelectTempWrapper
                        value={voice}
                        searchable={false}
                        clearable={false}
                        onChange={({value}: {value: string}) => Settings.set({voice: value})}
                        options={speechSynthesis.getVoices().map(({name, lang, voiceURI}) => ({
                            value: voiceURI,
                            label: (
                                <Flex>
                                    <Text style={{marginRight: 4}}>{name}</Text>
                                    <Text color={Text.Colors.MUTED}>[{lang}]</Text>
                                </Flex>
                            )
                        }))}
                    />
                </FormItem>
                <FormItem className={margins.marginBottom20}>
                    <FormTitle>TTS Volume</FormTitle>
                    <Slider
                        initialValue={volume}
                        maxValue={100}
                        minValue={0}
                        asValueChanges={(value: number) => Settings.set({volume: value})}
                    />
                </FormItem>
                <FormItem className={margins.marginBottom20}>
                    <FormTitle>TTS Speed</FormTitle>
                    <Slider
                        initialValue={speed}
                        maxValue={10}
                        minValue={0.1}
                        asValueChanges={(value: number) => Settings.set({speed: value})}
                        onValueRender={(value: number) => `${value.toFixed(2)}x`}
                        markers={[0.1, 1, 2, 5, 10]}
                        onMarkerRender={(value: number) => `${value.toFixed(2)}x`}
                    />
                </FormItem>
                <FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
                <FormItem>
                    <SwitchItem
                        value={filterNames}
                        onChange={(checked: boolean) => Settings.set({filterNames: checked})}
                        note="Limit user & channel names to alphanumeric characters."
                    >Enable Name Filter</SwitchItem>
                </FormItem>
                <FormItem>
                    <SwitchItem
                        value={filterBots}
                        onChange={(checked: boolean) => Settings.set({filterBots: checked})}
                        note="Disable notifications for bot users in voice."
                    >Enable Bot Filter</SwitchItem>
                </FormItem>
                <FormItem>
                    <SwitchItem
                        value={filterStages}
                        onChange={(checked: boolean) => Settings.set({filterStages: checked})}
                        note="Disable notifications for stage voice channels."
                    >Enable Stage Filter</SwitchItem>
                </FormItem>
                <FormSection>
                    <FormTitle tag="h3">Messages</FormTitle>
                    <FormText type="description" className={margins.marginBottom20}>
                        $user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.
                    </FormText>
                </FormSection>
                {([
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
                ]).map(({title, setting}, i) => (
                    <FormItem key={i} className={margins.marginBottom20}>
                        <FormTitle>{title}</FormTitle>
                        <Flex align={Flex.Align.CENTER}>
                            <div style={{flexGrow: 1, marginRight: 20}}>
                                <TextInput
                                    value={settings[setting]}
                                    placeholder={Settings.defaults[setting]}
                                    onChange={(value: string) => Settings.set({[setting]: value})}
                                />
                            </div>
                            <Button
                                size={Button.Sizes.SMALL}
                                onClick={() => speak(settings[setting]
                                    .split("$user").join("user")
                                    .split("$channel").join("channel")
                                )}
                            >Test</Button>
                        </Flex>
                    </FormItem>
                ))}
            </>
        )
    };
});
