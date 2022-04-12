import {createPlugin, Finder, Utils, React, Modules, Discord} from "dium";
import {settings, SettingsPanel, NotificationType} from "./settings";
import config from "./config.json";

const {Events, Channels, SelectedChannel, Users, Members} = Modules;
const {ActionTypes} = Modules.Constants;
const Audio = Finder.byProps("isSelfMute", "isSelfDeaf");
const VoiceStates = Finder.byProps("getVoiceStates", "hasVideo");

const {Text} = Modules;
const {MenuItem} = Modules.Menu;

interface VoiceState {
    channelId: Discord.Snowflake;
    userId: Discord.Snowflake;
    sessionId: string;
    deaf: boolean;
    mute: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfVideo: boolean;
    selfStream: boolean;
    suppress: boolean;
    requestToSpeakTimestamp?: any;
}

let prevStates: Record<string, VoiceState> = {};
const saveStates = () => {
    prevStates = {...VoiceStates.getVoiceStatesForChannel(SelectedChannel.getVoiceChannelId())};
};

export default createPlugin({...config, settings}, ({Logger, Patcher, Settings}) => {
    // backwards compatibility for settings
    const loaded = Settings.get() as any;
    for (const [key, value] of Object.entries(Settings.defaults.notifs)) {
        if (typeof loaded[key] === "string") {
            const {notifs} = Settings.get();
            notifs[key] = {...value, message: loaded[key]};
            Settings.set({notifs});
            Settings.delete(key);
        }
    }
    if (typeof loaded.privateCall === "string") {
        Settings.set({unknownChannel: loaded.privateCall});
        Settings.delete("privateCall");
    }

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

        // check for enabled
        if (!settings.notifs[type].enabled) {
            return;
        }

        const user = Users.getUser(userId) as Discord.User;
        const channel = Channels.getChannel(channelId) as Discord.Channel;

        // check for filters
        if (
            settings.filterBots && user?.bot
            || settings.filterStages && channel?.isGuildStageVoice()
        ) {
            return;
        }

        // resolve names
        const nick = Members.getMember(channel?.getGuildId(), userId)?.nick ?? user.username;
        const channelName = (!channel || channel.isDM() || channel.isGroupDM()) ? settings.unknownChannel : channel.name;

        // speak message
        speak(settings.notifs[type].message
            .split("$username").join(processName(user.username))
            .split("$user").join(processName(nick))
            .split("$channel").join(processName(channelName))
        );
    };

    const selfMuteListener = () => {
        const userId = Users.getCurrentUser().id;
        const channelId = SelectedChannel.getVoiceChannelId();
        notify(Audio.isSelfMute() ? "mute" : "unmute", userId, channelId);
    };

    const selfDeafListener = () => {
        const userId = Users.getCurrentUser().id;
        const channelId = SelectedChannel.getVoiceChannelId();
        notify(Audio.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
    };

    const voiceStateListener = (event) => {
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
        async start() {
            // save initial voice states
            saveStates();

            // listen for updates
            Events.subscribe(ActionTypes.VOICE_STATE_UPDATES, voiceStateListener);
            Logger.log("Subscribed to voice state events");

            Events.subscribe(ActionTypes.AUDIO_TOGGLE_SELF_MUTE, selfMuteListener);
            Logger.log("Subscribed to self mute events");

            Events.subscribe(ActionTypes.AUDIO_TOGGLE_SELF_DEAF, selfDeafListener);
            Logger.log("Subscribed to self deaf events");

            // wait for context menu lazy load
            const useChannelHideNamesItem = await Patcher.waitForContextMenu(
                () => Finder.query({name: "useChannelHideNamesItem"}) as {default: (channel: Discord.Channel) => JSX.Element}
            );

            // add queue clear item
            Patcher.after(useChannelHideNamesItem, "default", ({result}) => {
                if (result) {
                    return (
                        <>
                            {result}
                            <MenuItem
                                isFocused={false}
                                id="voiceevents-clear"
                                label="Clear notification queue"
                                action={() => speechSynthesis.cancel()}
                            />
                        </>
                    );
                }
            });
        },
        stop() {
            // reset
            prevStates = {};

            Events.unsubscribe(ActionTypes.VOICE_STATE_UPDATES, voiceStateListener);
            Logger.log("Unsubscribed from voice state events");

            Events.unsubscribe(ActionTypes.AUDIO_TOGGLE_SELF_MUTE, selfMuteListener);
            Logger.log("Unsubscribed from self mute events");

            Events.unsubscribe(ActionTypes.AUDIO_TOGGLE_SELF_DEAF, selfDeafListener);
            Logger.log("Unsubscribed from self deaf events");
        },
        settingsPanel: (props) => <SettingsPanel speak={speak} {...props}/>
    };
});
