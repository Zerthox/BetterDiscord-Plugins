/**
 * @name VoiceEvents
 * @author Zerthox
 * @version 1.5.1
 * @description Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.
 * @authorLink https://github.com/Zerthox
 * @donate https://paypal.me/zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/v1/VoiceEvents.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/v1/VoiceEvents.plugin.js
 */

/* @cc_on
    @if (@_jscript)
        var name = WScript.ScriptName.split(".")[0];
        var shell = WScript.CreateObject("WScript.Shell");
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        shell.Popup("Do NOT run random scripts from the internet with the Windows Script Host!\n\nYou are supposed to move this file to your BandagedBD/BetterDiscord plugins folder.", 0, name + ": Warning!", 0x1030);
        var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
        if (!fso.FolderExists(pluginsPath)) {
            if (shell.Popup("Unable to find the BetterDiscord plugins folder on your computer.\nOpen the download page of BandagedBD/BetterDiscord?", 0, name + ": BetterDiscord installation not found", 0x14) === 6) {
                shell.Exec("explorer \"https://github.com/rauenzi/betterdiscordapp/releases\"");
            }
        } else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
            shell.Popup("This plugin is already in the correct folder.\nNavigate to the \"Plugins\" settings tab in Discord and enable it there.", 0, name, 0x40);
        } else {
            shell.Exec("explorer " + pluginsPath);
        }
        WScript.Quit();
    @else
@*/

const {React, ReactDOM} = BdApi;
const Flux = BdApi.findModuleByProps("connectStores");

function qReact(node, query) {
    let match = false;

    try {
        match = query(node);
    } catch (err) {
        console.debug("Suppressed error in qReact query:\n", err);
    }

    if (match) {
        return node;
    } else if (node && node.props && node.props.children) {
        for (const child of [node.props.children].flat()) {
            const result = qReact(child, query);

            if (result) {
                return result;
            }
        }
    }

    return null;
}

const Module = {
    Events: BdApi.findModuleByProps("dispatch", "subscribe"),
    Channels: BdApi.findModuleByProps("getChannel"),
    SelectedChannel: BdApi.findModuleByProps("getChannelId", "getVoiceChannelId"),
    VoiceStates: BdApi.findModuleByProps("getVoiceStates"),
    Users: BdApi.findModuleByProps("getUser"),
    Members: BdApi.findModuleByProps("getMember")
};
const Component = {
    Flex: BdApi.findModuleByDisplayName("Flex"),
    Text: BdApi.findModuleByDisplayName("Text"),
    VerticalScroller: BdApi.findModuleByDisplayName("VerticalScroller"),
    Button: BdApi.findModuleByProps("Link", "Hovers"),
    Form: BdApi.findModuleByProps("FormSection", "FormText"),
    SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
    TextInput: BdApi.findModuleByDisplayName("TextInput"),
    SelectTempWrapper: BdApi.findModuleByDisplayName("SelectTempWrapper"),
    Slider: BdApi.findModuleByDisplayName("Slider"),
    Menu: BdApi.findModuleByProps("MenuGroup", "MenuItem", "MenuSeparator"),
    VoiceContextMenu: BdApi.findModule(
        (m) => m.default && m.default.displayName === "ChannelListVoiceChannelContextMenu"
    )
};
const Selector = {
    margins: BdApi.findModuleByProps("marginLarge")
};

class Plugin {
    constructor() {
        this.callback = this.onChange.bind(this);
        this.defaults = {
            voice: null,
            volume: 100,
            speed: 1,
            filterNames: true,
            filterBots: false,
            filterStages: true,
            join: "$user joined $channel",
            leave: "$user left $channel",
            joinSelf: "You joined $channel",
            moveSelf: "You were moved to $channel",
            leaveSelf: "You left $channel",
            privateCall: "The call"
        };
        const voices = speechSynthesis.getVoices();

        if (voices.length === 0) {
            this.error("Unable to find any speech synthesis voices");
            const {Text} = Component;
            BdApi.alert(
                `${this.getName()}`,
                React.createElement(
                    Text,
                    {
                        color: Text.Colors.STANDARD
                    },
                    "Electron does not have any Speech Synthesis Voices available on your system.",
                    React.createElement("br", null),
                    "The plugin will be unable to function properly."
                )
            );
        } else {
            this.defaults.voice = (voices.find((voice) => voice.lang === "en-US") || voices[0]).name;
        }
    }

    getSettings() {
        const self = this;
        const {Flex, Text, Button, SwitchItem, TextInput, SelectTempWrapper, Slider} = Component;
        const {FormSection, FormTitle, FormItem, FormText, FormDivider} = Component.Form;
        return class SettingsPanel extends React.Component {
            render() {
                return React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                        FormItem,
                        {
                            className: Selector.margins.marginBottom20
                        },
                        React.createElement(FormTitle, null, "TTS Voice"),
                        React.createElement(SelectTempWrapper, {
                            value: this.props.voice,
                            searchable: false,
                            clearable: false,
                            onChange: (e) =>
                                this.props.update({
                                    voice: e.value
                                }),
                            options: speechSynthesis.getVoices().map(({name, lang}) => ({
                                label: React.createElement(
                                    Flex,
                                    null,
                                    React.createElement(
                                        Text,
                                        {
                                            style: {
                                                marginRight: 4
                                            }
                                        },
                                        name
                                    ),
                                    React.createElement(
                                        Text,
                                        {
                                            color: Text.Colors.MUTED
                                        },
                                        "[",
                                        lang,
                                        "]"
                                    )
                                ),
                                value: name
                            }))
                        })
                    ),
                    React.createElement(
                        FormItem,
                        {
                            className: Selector.margins.marginBottom20
                        },
                        React.createElement(FormTitle, null, "TTS Volume"),
                        React.createElement(Slider, {
                            initialValue: this.props.volume,
                            maxValue: 100,
                            minValue: 0,
                            asValueChanges: (value) =>
                                this.props.update({
                                    volume: value
                                })
                        })
                    ),
                    React.createElement(
                        FormItem,
                        {
                            className: Selector.margins.marginBottom20
                        },
                        React.createElement(FormTitle, null, "TTS Speed"),
                        React.createElement(Slider, {
                            initialValue: this.props.speed,
                            maxValue: 10,
                            minValue: 0.1,
                            asValueChanges: (value) =>
                                this.props.update({
                                    speed: value
                                }),
                            onValueRender: (value) => `${value.toFixed(2)}x`,
                            markers: [0.1, 1, 2, 5, 10],
                            onMarkerRender: (value) => `${value.toFixed(2)}x`
                        })
                    ),
                    React.createElement(FormDivider, {
                        className: [Selector.margins.marginTop20, Selector.margins.marginBottom20].join(" ")
                    }),
                    React.createElement(
                        FormItem,
                        null,
                        React.createElement(
                            SwitchItem,
                            {
                                value: this.props.filterNames,
                                onChange: (checked) =>
                                    this.props.update({
                                        filterNames: checked
                                    }),
                                note: "Limit user & channel names to alphanumeric characters."
                            },
                            "Enable Name Filter"
                        )
                    ),
                    React.createElement(
                        FormItem,
                        null,
                        React.createElement(
                            SwitchItem,
                            {
                                value: this.props.filterBots,
                                onChange: (checked) =>
                                    this.props.update({
                                        filterBots: checked
                                    }),
                                note: "Disable notifications for bot users in voice."
                            },
                            "Enable Bot Filter"
                        )
                    ),
                    React.createElement(
                        FormItem,
                        null,
                        React.createElement(
                            SwitchItem,
                            {
                                value: this.props.filterStages,
                                onChange: (checked) =>
                                    this.props.update({
                                        filterStages: checked
                                    }),
                                note: "Disable notifications for stage voice channels."
                            },
                            "Enable Stage Filter"
                        )
                    ),
                    React.createElement(
                        FormSection,
                        null,
                        React.createElement(
                            FormTitle,
                            {
                                tag: "h3"
                            },
                            "Messages"
                        ),
                        React.createElement(
                            FormText,
                            {
                                type: "description",
                                className: Selector.margins.marginBottom20
                            },
                            "$user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name."
                        ),
                        this.generateInputs([
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
                        ])
                    )
                );
            }

            generateInputs(values) {
                return values.map(({title, setting}, i) =>
                    React.createElement(
                        FormItem,
                        {
                            key: i,
                            className: Selector.margins.marginBottom20
                        },
                        React.createElement(FormTitle, null, title),
                        React.createElement(
                            Flex,
                            {
                                align: Flex.Align.CENTER
                            },
                            React.createElement(
                                "div",
                                {
                                    style: {
                                        flexGrow: 1,
                                        marginRight: 20
                                    }
                                },
                                React.createElement(TextInput, {
                                    onChange: (e) =>
                                        this.props.update({
                                            [setting]: e
                                        }),
                                    value: this.props[setting],
                                    placeholder: self.defaults[setting]
                                })
                            ),
                            React.createElement(
                                Button,
                                {
                                    size: Button.Sizes.SMALL,
                                    onClick: () =>
                                        self.speak(
                                            self.settings[setting]
                                                .split("$user")
                                                .join("user")
                                                .split("$username")
                                                .join("username")
                                                .split("$channel")
                                                .join("channel")
                                        )
                                },
                                "Test"
                            )
                        )
                    )
                );
            }
        };
    }

    start() {
        this.cloneStates();
        Module.Events.subscribe("VOICE_STATE_UPDATE", this.callback);
        const {MenuGroup, MenuItem} = Component.Menu;
        this.createPatch(Component.VoiceContextMenu, "default", {
            after: ({returnValue}) => {
                const {children} = returnValue.props;
                const index = children.findIndex(
                    (node) =>
                        node &&
                        [node.props.children].flat().find((child) => child && child.props.id === "delete-channel")
                );
                children.splice(
                    index,
                    0,
                    React.createElement(
                        MenuGroup,
                        null,
                        React.createElement(MenuItem, {
                            isFocused: false,
                            id: "voiceevents-clear",
                            label: "Clear Notification queue",
                            action: () => speechSynthesis.cancel()
                        })
                    )
                );
                return returnValue;
            }
        });
    }

    stop() {
        this.states = {};
        Module.Events.unsubscribe("VOICE_STATE_UPDATE", this.callback);
    }

    cloneStates() {
        const {SelectedChannel, VoiceStates} = Module;
        this.states = {...VoiceStates.getVoiceStatesForChannel(SelectedChannel.getVoiceChannelId())};
    }

    onChange(event) {
        try {
            const {Users, SelectedChannel, VoiceStates} = Module;
            const {userId, channelId} = event;
            const prev = this.states[userId];

            if (userId === Users.getCurrentUser().id) {
                if (!channelId) {
                    this.notify({
                        type: "leaveSelf",
                        userId,
                        channelId: prev.channelId
                    });
                    this.cloneStates();
                } else if (!prev) {
                    this.notify({
                        type: "joinSelf",
                        userId,
                        channelId
                    });
                    this.cloneStates();
                } else if (prev.channelId !== channelId) {
                    this.notify({
                        type: "moveSelf",
                        userId,
                        channelId
                    });
                    this.cloneStates();
                }
            } else {
                const selectedChannelId = SelectedChannel.getVoiceChannelId();

                if (selectedChannelId) {
                    if (!prev && channelId === selectedChannelId) {
                        this.notify({
                            type: "join",
                            userId,
                            channelId
                        });
                        this.cloneStates();
                    } else if (prev && !VoiceStates.getVoiceStatesForChannel(selectedChannelId)[userId]) {
                        this.notify({
                            type: "leave",
                            userId,
                            channelId: selectedChannelId
                        });
                        this.cloneStates();
                    }
                }
            }
        } catch (err) {
            this.error("Error processing voice state change, see details below");
            console.error(err);
        }
    }

    processName(name) {
        return this.settings.filterNames
            ? name
                  .split("")
                  .map((char) => (/[a-zA-Z0-9]/.test(char) ? char : " "))
                  .join("")
            : name;
    }

    notify({type, userId, channelId}) {
        const {Channels, Users, Members} = Module;
        const channel = Channels.getChannel(channelId);
        const isDM = channel.isDM() || channel.isGroupDM();
        const user = Users.getUser(userId);

        if (this.settings.filterBots && user.bot) {
            return;
        }

        if (this.settings.filterStages && channel.isGuildStageVoice()) {
            return;
        }

        const nick = (!isDM && Members.getMember(channel.getGuildId(), userId).nick) || user.username;
        const channelName = isDM ? this.settings.privateCall : channel.name;
        const msg = this.settings[type]
            .split("$username")
            .join(this.processName(user.username))
            .split("$user")
            .join(this.processName(nick))
            .split("$channel")
            .join(this.processName(channelName));
        this.speak(msg);
    }

    speak(msg) {
        const voices = speechSynthesis.getVoices();

        if (voices.length === 0) {
            this.error(`Message "${msg}" could not be played: No speech synthesis voices available`);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.voice = voices.find((e) => e.name === this.settings.voice);
        utterance.volume = this.settings.volume / 100;
        utterance.rate = this.settings.speed;

        if (!utterance.voice) {
            this.error(
                `Message "${msg}" could not be played: Set speech synthesis voice "${this.settings.voice}" could not be found`
            );
            return;
        }

        speechSynthesis.speak(utterance);
    }
}

module.exports = class Wrapper extends Plugin {
    getName() {
        return "VoiceEvents";
    }

    getVersion() {
        return "1.5.1";
    }

    getAuthor() {
        return "Zerthox";
    }

    getDescription() {
        return "Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.";
    }

    log(...msgs) {
        console.log(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    warn(...msgs) {
        console.warn(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    error(...msgs) {
        console.error(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    constructor(...args) {
        super(...args);
        this._Patches = [];

        if (this.defaults) {
            this.settings = {...this.defaults, ...this.loadData("settings")};
        }
    }

    start() {
        this.log("Enabled");
        super.start();
    }

    stop() {
        while (this._Patches.length > 0) {
            this._Patches.pop()();
        }

        this.log("Unpatched all");

        if (document.getElementById(this.getName())) {
            BdApi.clearCSS(this.getName());
        }

        super.stop();
        this.log("Disabled");
    }

    saveData(id, value) {
        return BdApi.saveData(this.getName(), id, value);
    }

    loadData(id, fallback = null) {
        const data = BdApi.loadData(this.getName(), id);
        return data !== undefined && data !== null ? data : fallback;
    }

    injectCSS(css) {
        const el = document.getElementById(this.getName());

        if (!el) {
            BdApi.injectCSS(this.getName(), css);
        } else {
            el.innerHTML += "\n\n/* --- */\n\n" + css;
        }
    }

    createPatch(target, method, options) {
        options.silent = true;

        this._Patches.push(BdApi.monkeyPatch(target, method, options));

        const name =
            options.name ||
            target.displayName ||
            target.name ||
            target.constructor.displayName ||
            target.constructor.name ||
            "Unknown";
        this.log(
            `Patched ${method} of ${name} ${
                options.type === "component" || target instanceof React.Component ? "component" : "module"
            }`
        );
    }

    async forceUpdate(...classes) {
        this.forceUpdateElements(...classes.map((e) => Array.from(document.getElementsByClassName(e))).flat());
    }

    async forceUpdateElements(...elements) {
        for (const el of elements) {
            try {
                let fiber = BdApi.getInternalInstance(el);

                if (fiber) {
                    while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
                        fiber = fiber.return;
                    }

                    fiber.stateNode.forceUpdate();
                }
            } catch (e) {
                this.warn(
                    `Failed to force update "${
                        el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName
                    }" state node`
                );
                console.error(e);
            }
        }
    }
};

if (Plugin.prototype.getSettings) {
    const Flex = BdApi.findModuleByDisplayName("Flex");
    const Button = BdApi.findModuleByProps("Link", "Hovers");
    const Form = BdApi.findModuleByProps("FormItem", "FormSection", "FormDivider");
    const Margins = BdApi.findModuleByProps("marginLarge");

    class Settings extends React.Component {
        constructor(...args) {
            super(...args);
            this.state = this.props.current;
        }

        render() {
            const {name, defaults, children: Child} = this.props;
            return React.createElement(
                Form.FormSection,
                null,
                React.createElement(Child, {
                    update: (changed) => this.update({...this.state, ...changed}),
                    ...this.state
                }),
                React.createElement(Form.FormDivider, {
                    className: [Margins.marginTop20, Margins.marginBottom20].join(" ")
                }),
                React.createElement(
                    Flex,
                    {
                        justify: Flex.Justify.END
                    },
                    React.createElement(
                        Button,
                        {
                            size: Button.Sizes.SMALL,
                            onClick: () =>
                                BdApi.showConfirmationModal(name, "Reset all settings?", {
                                    onConfirm: () => this.update(defaults)
                                })
                        },
                        "Reset"
                    )
                )
            );
        }

        update(settings) {
            this.setState(settings);
            this.props.onChange(settings);
        }
    }

    module.exports.prototype.getSettingsPanel = function () {
        return React.createElement(
            Settings,
            {
                name: this.getName(),
                current: this.settings,
                defaults: this.defaults,
                onChange: (settings) => {
                    this.settings = settings;

                    if (this.update instanceof Function) {
                        this.update();
                    }

                    this.saveData("settings", settings);
                }
            },
            this.getSettings()
        );
    };
}

/* @end@*/
