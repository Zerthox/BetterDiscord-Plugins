import {createSettings, SettingsType, Logger, Utils, React, getMeta} from "dium";
import {Text} from "@dium/components";

export const findDefaultVoice = (): SpeechSynthesisVoice => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        Logger.error("No speech synthesis voices available");
        Utils.alert(
            getMeta().name,
            <Text color="text-normal">
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

export const findCurrentVoice = (): SpeechSynthesisVoice => {
    const uri = Settings.current.voice;
    const voice = speechSynthesis.getVoices().find((voice) => voice.voiceURI === uri);
    if (voice) {
        return voice;
    } else {
        Logger.warn(`Voice "${uri}" not found, reverting to default`);
        const defaultVoice = findDefaultVoice();
        Settings.update({voice: defaultVoice.voiceURI});
        return defaultVoice;
    }
};

export const Settings = createSettings({
    voice: findDefaultVoice()?.voiceURI,
    volume: 100,
    speed: 1,
    filterNames: true,
    filterBots: false,
    filterStages: true,
    notifs: {
        mute: {
            enabled: true,
            message: "Muted"
        },
        unmute: {
            enabled: true,
            message: "Unmuted"
        },
        deafen: {
            enabled: true,
            message: "Deafened"
        },
        undeafen: {
            enabled: true,
            message: "Undeafened"
        },
        join: {
            enabled: true,
            message: "$user joined $channel"
        },
        leave: {
            enabled: true,
            message: "$user left $channel"
        },
        joinSelf: {
            enabled: true,
            message: "You joined $channel"
        },
        moveSelf: {
            enabled: true,
            message: "You were moved to $channel"
        },
        leaveSelf: {
            enabled: true,
            message: "You left $channel"
        }
    },
    unknownChannel: "The call"
});

export type NotificationType = keyof SettingsType<typeof Settings>["notifs"];
