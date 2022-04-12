import {Finder, React, Modules, classNames, SettingsProps} from "dium";

const {Flex, Button, Text, Switch, SwitchItem, TextInput, Slider} = Modules;
const {FormSection, FormTitle, FormItem, FormText, FormDivider} = Modules.Form;
const SelectTempWrapper = Finder.byName("SelectTempWrapper");

const {margins} = Modules;

export const settings = {
    voice: null as string,
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
};

export type NotificationType = keyof typeof settings.notifs;

const titles: Record<NotificationType, string> = {
    mute: "Mute (Self)",
    unmute: "Unmute (Self)",
    deafen: "Deafen (Self)",
    undeafen: "Undeafen (Self)",
    join: "Join (Other Users)",
    leave: "Leave (Other Users)",
    joinSelf: "Join (Self)",
    moveSelf: "Move (Self)",
    leaveSelf: "Leave (Self)"
};

export type SettingsPanelProps = SettingsProps<typeof settings> & {speak(msg: string): void};

export const SettingsPanel = ({speak, defaults, set, voice, volume, speed, filterNames, filterBots, filterStages, ...settings}: SettingsPanelProps): JSX.Element => (
    <>
        <FormItem className={margins.marginBottom20}>
            <FormTitle>TTS Voice</FormTitle>
            <SelectTempWrapper
                value={voice}
                searchable={false}
                clearable={false}
                onChange={({value}: {value: string}) => set({voice: value})}
                options={speechSynthesis.getVoices().map(({name, lang, voiceURI}) => ({
                    value: voiceURI,
                    label: (
                        <Flex>
                            <Text style={{marginRight: 4}}>{name}</Text>
                            <Text color={Text.Colors.MUTED}>[{lang}]</Text>
                        </Flex>
                    )
                }))}
            />
        </FormItem>
        <FormItem className={margins.marginBottom20}>
            <FormTitle>TTS Volume</FormTitle>
            <Slider
                initialValue={volume}
                maxValue={100}
                minValue={0}
                asValueChanges={(value: number) => set({volume: value})}
            />
        </FormItem>
        <FormItem className={margins.marginBottom20}>
            <FormTitle>TTS Speed</FormTitle>
            <Slider
                initialValue={speed}
                maxValue={10}
                minValue={0.1}
                asValueChanges={(value: number) => set({speed: value})}
                onValueRender={(value: number) => `${value.toFixed(2)}x`}
                markers={[0.1, 1, 2, 5, 10]}
                onMarkerRender={(value: number) => `${value.toFixed(2)}x`}
            />
        </FormItem>
        <FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
        <FormItem>
            <SwitchItem
                value={filterNames}
                onChange={(checked: boolean) => set({filterNames: checked})}
                note="Limit user & channel names to alphanumeric characters."
            >Enable Name Filter</SwitchItem>
        </FormItem>
        <FormItem>
            <SwitchItem
                value={filterBots}
                onChange={(checked: boolean) => set({filterBots: checked})}
                note="Disable notifications for bot users in voice."
            >Enable Bot Filter</SwitchItem>
        </FormItem>
        <FormItem>
            <SwitchItem
                value={filterStages}
                onChange={(checked: boolean) => set({filterStages: checked})}
                note="Disable notifications for stage voice channels."
            >Enable Stage Filter</SwitchItem>
        </FormItem>
        <FormSection>
            <FormTitle tag="h3">Notifications</FormTitle>
            <FormText type="description" className={margins.marginBottom20}>
                $user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.
            </FormText>
        </FormSection>
        {Object.entries(titles).map(([key, title]) => (
            <FormItem key={key} className={margins.marginBottom20}>
                <FormTitle>{title}</FormTitle>
                <Flex align={Flex.Align.CENTER}>
                    <Flex.Child grow={1}>
                        <div>
                            <TextInput
                                value={settings.notifs[key].message}
                                placeholder={defaults.notifs[key].message}
                                onChange={(value: string) => {
                                    const {notifs} = settings;
                                    notifs[key].message = value;
                                    set({notifs});
                                }}
                            />
                        </div>
                    </Flex.Child>
                    <Flex.Child grow={0}>
                        <Switch
                            className={margins.marginRight20}
                            checked={settings.notifs[key].enabled}
                            onChange={(value: boolean) => {
                                const {notifs} = settings;
                                notifs[key].enabled = value;
                                set({notifs});
                            }}
                        />
                    </Flex.Child>
                    <Flex.Child grow={0}>
                        <Button
                            size={Button.Sizes.SMALL}
                            onClick={() => speak(
                                settings.notifs[key].message
                                    .split("$user").join("user")
                                    .split("$channel").join("channel")
                            )}
                        >Test</Button>
                    </Flex.Child>
                </Flex>
            </FormItem>
        ))}
        <FormItem key="unknownChannel" className={margins.marginBottom20}>
            <FormTitle>Unknown Channel Name</FormTitle>
            <Flex align={Flex.Align.CENTER}>
                <Flex.Child grow={1}>
                    <div>
                        <TextInput
                            value={settings.unknownChannel}
                            placeholder={defaults.unknownChannel}
                            onChange={(value: string) => set({unknownChannel: value})}
                        />
                    </div>
                </Flex.Child>
                <Flex.Child grow={0}>
                    <Button
                        size={Button.Sizes.SMALL}
                        onClick={() => speak(settings.unknownChannel)}
                    >Test</Button>
                </Flex.Child>
            </Flex>
        </FormItem>
    </>
);
