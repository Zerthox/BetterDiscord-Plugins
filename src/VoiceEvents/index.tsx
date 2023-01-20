import {createPlugin, Logger, Patcher, Utils, React} from "dium";
import {
    Dispatcher,
    SelectedChannelStore,
    UserStore,
    VoiceState,
    VoiceStateStore,
    MediaEngineStore,
    Snowflake
} from "@dium/modules";
import {MenuItem} from "@dium/components";
import {Settings} from "./settings";
import {SettingsPanel} from "./settings-panel";
import {findDefaultVoice, notify} from "./voice";

const selfMuteHandler = () => {
    const userId = UserStore.getCurrentUser().id;
    const channelId = SelectedChannelStore.getVoiceChannelId();
    notify(MediaEngineStore.isSelfMute() ? "mute" : "unmute", userId, channelId);
};

const selfDeafHandler = () => {
    const userId = UserStore.getCurrentUser().id;
    const channelId = SelectedChannelStore.getVoiceChannelId();
    notify(MediaEngineStore.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
};

interface VoiceStateUpdatesAction {
    type: "VOICE_STATE_UPDATES";
    voiceStates: VoiceState[];
}

let prevStates: Record<Snowflake, VoiceState> = {};
const saveStates = () => {
    prevStates = {...VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId())};
};

const voiceStateHandler = (action: VoiceStateUpdatesAction) => {
    for (const {userId, channelId} of action.voiceStates) {
        try {
            const prev = prevStates[userId];

            if (userId === UserStore.getCurrentUser().id) {
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
                const selectedChannelId = SelectedChannelStore.getVoiceChannelId();
                if (!selectedChannelId) {
                    // user is not in voice
                    return;
                }

                if (!prev && channelId === selectedChannelId) {
                    // no previous state & same channel is join
                    notify("join", userId, channelId);
                    saveStates();
                } else if (prev && !VoiceStateStore.getVoiceStatesForChannel(selectedChannelId)[userId]) {
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

export default createPlugin({
    start() {
        // initialize default voice
        const voice = findDefaultVoice()?.voiceURI;
        Settings.defaults.voice = voice;
        if (!Settings.current.voice) {
            Settings.update({voice});
        }

        // save initial voice states
        saveStates();

        // listen for updates
        Dispatcher.subscribe("VOICE_STATE_UPDATES", voiceStateHandler);
        Logger.log("Subscribed to voice state actions");

        Dispatcher.subscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteHandler);
        Logger.log("Subscribed to self mute actions");

        Dispatcher.subscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafHandler);
        Logger.log("Subscribed to self deaf actions");

        // patch channel context menu
        Patcher.contextMenu("channel-context", (result) => {
            const [parent, index] = Utils.queryTreeForParent(result, (child) => child?.props?.id === "hide-voice-names");
            if (parent) {
                parent.props.children.splice(index + 1, 0, (
                    <MenuItem
                        isFocused={false}
                        id="voiceevents-clear"
                        label="Clear VoiceEvents queue"
                        action={() => speechSynthesis.cancel()}
                    />
                ));
            }
        });
    },
    stop() {
        // reset
        prevStates = {};

        Dispatcher.unsubscribe("VOICE_STATE_UPDATES", voiceStateHandler);
        Logger.log("Unsubscribed from voice state actions");

        Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteHandler);
        Logger.log("Unsubscribed from self mute actions");

        Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafHandler);
        Logger.log("Unsubscribed from self deaf actions");
    },
    Settings,
    SettingsPanel
});
