import {createPlugin, Finder, Utils, React, Modules, Discord} from "discordium";
import {settings, SettingsPanel} from "./settings";
import config from "./config.json";

const {Events, Channels, SelectedChannel, Users, Members} = Modules;
const {ActionTypes} = Modules.Constants;
const VoiceStates = Finder.byProps("getVoiceStates", "hasVideo");

const Text = Finder.byName("Text");
const {MenuItem} = Modules.Menu;

type NotificationType = "join" | "leave" | "joinSelf" | "moveSelf" | "leaveSelf";

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
        const user = Users.getUser(userId) as Discord.User;
        const channel = Channels.getChannel(channelId) as Discord.Channel;
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
        async start() {
            // save initial voice states
            saveStates();

            // listen for updates
            Events.subscribe(ActionTypes.VOICE_STATE_UPDATES, listener);
            Logger.log("Subscribed to voice state updates");

            // wait for context menu lazy load
            const useChannelHideNamesItem = await Patcher.waitForContextMenu(
                () => Finder.raw.byName("useChannelHideNamesItem")?.exports as {default: (channel: Discord.Channel) => JSX.Element}
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

            Events.unsubscribe(ActionTypes.VOICE_STATE_UPDATES, listener);
            Logger.log("Unsubscribed from voice state updates");
        },
        settingsPanel: (props) => <SettingsPanel speak={speak} {...props}/>
    };
});
