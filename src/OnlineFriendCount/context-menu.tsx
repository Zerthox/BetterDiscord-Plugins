import { React } from "dium";
import { Settings, counterLabels } from "./settings";
import { Menu, MenuGroup, MenuCheckboxItem } from "@dium/components";

export const CountContextMenu = (props: React.ComponentProps<typeof Menu>): React.JSX.Element => {
    const [settings, setSettings] = Settings.useState();

    return (
        <Menu {...props}>
            <MenuGroup>
                {Object.entries(counterLabels).map(([id, { label, long }]) => (
                    <MenuCheckboxItem
                        key={id}
                        id={id}
                        label={long ?? label}
                        checked={settings[id]}
                        action={() => setSettings({ [id]: !settings[id] })}
                    />
                ))}
            </MenuGroup>
            <MenuGroup>
                <MenuCheckboxItem
                    id="interval"
                    label="Auto rotate"
                    checked={settings.interval}
                    action={() => setSettings({ interval: !settings.interval })}
                />
            </MenuGroup>
        </Menu>
    );
};
