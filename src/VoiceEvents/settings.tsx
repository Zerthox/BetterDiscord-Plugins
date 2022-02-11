import {Finder, React, Modules, classNames, SettingsProps} from "discordium";

const {Flex, Button, margins} = Modules;
const Text = Finder.byName("Text");
const {FormSection, FormTitle, FormItem, FormText, FormDivider} = Modules.Form;
const Switch = Finder.byName("Switch");
const SwitchItem = Finder.byName("SwitchItem");
const TextInput = Finder.byName("TextInput");
const SelectTempWrapper = Finder.byName("SelectTempWrapper");
const Slider = Finder.byName("Slider");

export const settings = {
    voice: null as string,
    volume: 100,
    speed: 1,
    filterNames: true,
    filterBots: false,
    filterStages: true,
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
    },
    privateCall: {
        enabled: true,
        message: "The call"
    }
};

export type SettingsPanelProps = SettingsProps<typeof settings> & {speak(msg: string): void};

export const SettingsPanel = ({speak, defaults, set, voice, volume, speed, filterNames, filterBots, filterStages, ...settings}: SettingsPanelProps) => (
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
            <FormTitle tag="h3">Messages</FormTitle>
            <FormText type="description" className={margins.marginBottom20}>
                $user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.
            </FormText>
        </FormSection>
        {([
            {
                title: "Join Message (Other Users)",
                setting: "join"
            },
            {
                title: "Leave Message (Other Users)",
                setting: "leave"
            },
            {
                title: "Join Message (Self)",
                setting: "joinSelf"
            },
            {
                title: "Move Message (Self)",
                setting: "moveSelf"
            },
            {
                title: "Leave Message (Self)",
                setting: "leaveSelf"
            },
            {
                title: "Private Call channel name",
                setting: "privateCall"
            }
        ] as const).map(({title, setting}, i) => (
            <FormItem key={i} className={margins.marginBottom20}>
                <FormTitle>{title}</FormTitle>
                <Flex align={Flex.Align.CENTER}>
                    <Flex.Child grow={1}>
                        <div>
                            <TextInput
                                value={settings[setting].message}
                                placeholder={defaults[setting].message}
                                onChange={(value: string) => set({
                                    [setting]: {...settings[setting], message: value}
                                })}
                            />
                        </div>
                    </Flex.Child>
                    <Flex.Child grow={0}>
                        <Switch
                            className={margins.marginRight20}
                            checked={settings[setting].enabled}
                            onChange={(value: boolean) => set({
                                [setting]: {...settings[setting], enabled: value}
                            })}
                        />
                    </Flex.Child>
                    <Flex.Child grow={0}>
                        <Button
                            size={Button.Sizes.SMALL}
                            onClick={() => speak(settings[setting].message
                                .split("$user").join("user")
                                .split("$channel").join("channel")
                            )}
                        >Test</Button>
                    </Flex.Child>
                </Flex>
            </FormItem>
        ))}
    </>
);
