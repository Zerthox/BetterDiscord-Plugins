import {React} from "dium";
import {classNames} from "@dium/modules";
import {
    Flex,
    Button,
    Text,
    Switch,
    SwitchItem,
    TextInput,
    Slider,
    FormSection,
    FormTitle,
    FormItem,
    FormText,
    FormDivider,
    SingleSelect,
    margins
} from "@dium/components";
import {Settings, NotificationType} from "./settings";
import {speak} from "./voice";

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

interface VoiceLabelProps {
    name: string;
    lang: string;
}

const VoiceLabel = ({name, lang}: VoiceLabelProps): JSX.Element => (
    <Flex direction={Flex.Direction.HORIZONTAL} align={Flex.Align.CENTER}>
        <Text variant="text-md/normal">{name}</Text>
        <Text
            variant="text-xs/semibold"
            style={{marginLeft: 8}}
        >{lang}</Text>
    </Flex>
);

export const SettingsPanel = (): JSX.Element => {
    const [
        {voice, volume, speed, filterNames, filterBots, filterStages, ...settings},
        defaults,
        setSettings
    ] = Settings.useStateWithDefaults();

    return (
        <>
            <FormItem className={margins.marginBottom20}>
                <FormTitle>TTS Voice</FormTitle>
                <SingleSelect
                    value={voice}
                    options={speechSynthesis.getVoices().map(({name, lang, voiceURI}) => ({
                        value: voiceURI,
                        label: name,
                        lang
                    }))}
                    onChange={(value) => setSettings({voice: value})}
                    renderOptionLabel={({label, lang}) => <VoiceLabel name={label} lang={lang}/>}
                    renderOptionValue={([{label, lang}]) => <VoiceLabel name={label} lang={lang}/>}
                />
            </FormItem>
            <FormItem className={margins.marginBottom20}>
                <FormTitle>TTS Volume</FormTitle>
                <Slider
                    initialValue={volume}
                    maxValue={100}
                    minValue={0}
                    asValueChanges={(value: number) => setSettings({volume: value})}
                />
            </FormItem>
            <FormItem className={margins.marginBottom20}>
                <FormTitle>TTS Speed</FormTitle>
                <Slider
                    initialValue={speed}
                    maxValue={10}
                    minValue={0.1}
                    asValueChanges={(value: number) => setSettings({speed: value})}
                    onValueRender={(value: number) => `${value.toFixed(2)}x`}
                    markers={[0.1, 1, 2, 5, 10]}
                    onMarkerRender={(value: number) => `${value.toFixed(2)}x`}
                />
            </FormItem>
            <FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
            <FormItem>
                <SwitchItem
                    value={filterNames}
                    onChange={(checked) => setSettings({filterNames: checked})}
                    note="Limit user & channel names to alphanumeric characters."
                >Enable Name Filter</SwitchItem>
            </FormItem>
            <FormItem>
                <SwitchItem
                    value={filterBots}
                    onChange={(checked) => setSettings({filterBots: checked})}
                    note="Disable notifications for bot users in voice."
                >Enable Bot Filter</SwitchItem>
            </FormItem>
            <FormItem>
                <SwitchItem
                    value={filterStages}
                    onChange={(checked) => setSettings({filterStages: checked})}
                    note="Disable notifications for stage voice channels."
                >Enable Stage Filter</SwitchItem>
            </FormItem>
            <FormSection>
                <FormTitle tag="h3">Notifications</FormTitle>
                <FormText type="description" className={margins.marginBottom20}>
                    <Text tag="span" variant="code">$user</Text> will get replaced with the respective User Nickname, <Text tag="span" variant="code">$username</Text> with the User Account name and <Text tag="span" variant="code">$channel</Text> with the respective Voice Channel name.
                </FormText>
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
                                            setSettings({notifs});
                                        }}
                                    />
                                </div>
                            </Flex.Child>
                            <Flex.Child grow={0}>
                                <Switch
                                    checked={settings.notifs[key].enabled}
                                    onChange={(value: boolean) => {
                                        const {notifs} = settings;
                                        notifs[key].enabled = value;
                                        setSettings({notifs});
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
                                    onChange={(value: string) => setSettings({unknownChannel: value})}
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
            </FormSection>
        </>
    );
};
