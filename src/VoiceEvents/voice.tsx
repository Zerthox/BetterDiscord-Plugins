import {Logger, Utils, React, getMeta} from "dium";
import {ChannelStore, UserStore, GuildMemberStore} from "@dium/modules";
import {Text} from "@dium/components";
import {Settings, NotificationType} from "./settings";

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

export const speak = (message: string): void => {
    const {volume, speed} = Settings.current;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = findCurrentVoice();
    utterance.volume = volume / 100;
    utterance.rate = speed;

    speechSynthesis.speak(utterance);
};

const processName = (name: string) => {
    return Settings.current.filterNames ? name.split("").map((char) => /[a-zA-Z0-9]/.test(char) ? char : " ").join("") : name;
};

export const notify = (type: NotificationType, userId: string, channelId: string): void => {
    const settings = Settings.current;
    const notif = settings.notifs[type];

    // check for enabled
    if (!notif.enabled) {
        return;
    }

    const user = UserStore.getUser(userId);
    const channel = ChannelStore.getChannel(channelId);

    // check for filters
    if (
        settings.filterBots && user?.bot
        || settings.filterStages && channel?.isGuildStageVoice()
    ) {
        return;
    }

    // resolve names
    const displayName = user.globalName ?? user.username;
    const nick = GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? displayName;
    const channelName = (!channel || channel.isDM() || channel.isGroupDM()) ? settings.unknownChannel : channel.name;

    // speak message
    const message = notif.message
        .replaceAll("$username", processName(user.username))
        .replaceAll("$displayname", processName(user.username))
        .replaceAll("$user", processName(nick))
        .replaceAll("$channel", processName(channelName));
    speak(message);
};
