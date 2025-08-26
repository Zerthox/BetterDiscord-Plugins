import { createSettings, SettingsType } from "dium";

export const Settings = createSettings({
    voice: null as string, // set later
    volume: 100,
    speed: 1,
    filterNames: true,
    filterBots: false,
    filterStages: true,
    notifs: {
        mute: {
            enabled: true,
            message: "Muted",
        },
        unmute: {
            enabled: true,
            message: "Unmuted",
        },
        deafen: {
            enabled: true,
            message: "Deafened",
        },
        undeafen: {
            enabled: true,
            message: "Undeafened",
        },
        join: {
            enabled: true,
            message: "$user joined $channel",
        },
        leave: {
            enabled: true,
            message: "$user left $channel",
        },
        joinSelf: {
            enabled: true,
            message: "You joined $channel",
        },
        moveSelf: {
            enabled: true,
            message: "You were moved to $channel",
        },
        leaveSelf: {
            enabled: true,
            message: "You left $channel",
        },
    },
    unknownChannel: "The call",
});

export type NotificationType = keyof SettingsType<typeof Settings>["notifs"];
