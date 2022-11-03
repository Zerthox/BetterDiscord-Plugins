import {React, SettingsType} from "dium";
import {Settings} from "./settings";
import {Menu, MenuGroup, MenuCheckboxItem} from "@dium/components";

const items: Record<keyof SettingsType<typeof Settings>, string> = {
    guilds: "Servers",
    friends: "Friends",
    friendsOnline: "Online Friends",
    pending: "Pending Friend Requests",
    blocked: "Blocked Users"
};

export const CountContextMenu = (props: React.ComponentProps<typeof Menu>): JSX.Element => {
    const [settings, setSettings] = Settings.useState();

    return (
        <Menu {...props}>
            <MenuGroup>
                {Object.entries(items).map(([id, label]) => (
                    <MenuCheckboxItem
                        key={id}
                        id={id}
                        label={label}
                        checked={settings[id]}
                        action={() => setSettings({[id]: !settings[id]})}
                    />
                ))}
            </MenuGroup>
        </Menu>
    );
};
