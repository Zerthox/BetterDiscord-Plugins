import { createSettings } from "dium";

export const Settings = createSettings({
    guilds: false,
    friends: false,
    friendsOnline: true,
    pending: false,
    blocked: false,
    interval: false,
});

export const enum CounterType {
    Guilds = "guilds",
    Friends = "friends",
    FriendsOnline = "friendsOnline",
    Pending = "pending",
    Blocked = "blocked",
}

export interface CounterLabel {
    label: string;
    long?: string;
}

export const counterLabels: Record<CounterType, CounterLabel> = {
    guilds: {
        label: "Servers",
    },
    friends: {
        label: "Friends",
    },
    friendsOnline: {
        label: "Online",
        long: "Online Friends",
    },
    pending: {
        label: "Pending",
        long: "Pending Friend Requests",
    },
    blocked: {
        label: "Blocked",
        long: "Blocked Users",
    },
};
