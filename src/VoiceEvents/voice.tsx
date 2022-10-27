import {Channel, ChannelStore, User, UserStore, GuildMemberStore} from "@dium/modules";
import {Settings, NotificationType, findCurrentVoice} from "./settings";

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

    // check for enabled
    if (!settings.notifs[type].enabled) {
        return;
    }

    const user = UserStore.getUser(userId) as User;
    const channel = ChannelStore.getChannel(channelId) as Channel;

    // check for filters
    if (
        settings.filterBots && user?.bot
        || settings.filterStages && channel?.isGuildStageVoice()
    ) {
        return;
    }

    // resolve names
    const nick = GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? user.username;
    const channelName = (!channel || channel.isDM() || channel.isGroupDM()) ? settings.unknownChannel : channel.name;

    // speak message
    speak(settings.notifs[type].message
        .split("$username").join(processName(user.username))
        .split("$user").join(processName(nick))
        .split("$channel").join(processName(channelName))
    );
};
