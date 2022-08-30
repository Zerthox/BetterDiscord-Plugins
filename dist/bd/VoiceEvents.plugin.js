/**
 * @name VoiceEvents
 * @author Zerthox
 * @version 2.2.6
 * @description Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/VoiceEvents
**/

/*@cc_on @if (@_jscript)
var pluginName = WScript.ScriptName.split(".")[0];
var shell = WScript.CreateObject("WScript.Shell");
shell.Popup(
    "Do NOT run scripts from the internet with the Windows Script Host!\nMove this file to your BetterDiscord plugins folder.",
    0,
    pluginName + ": Warning!",
    0x1030
);
var fso = new ActiveXObject("Scripting.FileSystemObject");
var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
if (!fso.FolderExists(pluginsPath)) {
    var popup = shell.Popup(
        "Unable to find BetterDiscord on your computer.\nOpen the download page of BetterDiscord?",
        0,
        pluginName + ": BetterDiscord not found",
        0x34
    );
    if (popup === 6) {
        shell.Exec("explorer \"https://betterdiscord.app\"");
    }
} else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
    shell.Popup(
        "This plugin is already in the correct folder.\nNavigate to the \"Plugins\" settings tab in Discord and enable it there.",
        0,
        pluginName,
        0x40
    );
} else {
    var popup = shell.Popup(
        "Open the BetterDiscord plugins folder?",
        0,
        pluginName,
        0x34
    );
    if (popup === 6) {
        shell.Exec("explorer " + pluginsPath);
    }
}
WScript.Quit();
@else @*/

'use strict';

const createData = (id) => ({
    load: (key) => BdApi.loadData(id, key) ?? null,
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});

const byName = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byAnyName$1 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byName(name));
};
const byProps$1 = (props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

const resolveExport = (target, filter) => {
    if (target && typeof filter === "function") {
        return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
    }
    return target;
};
const find = (filter, resolve = true) => BdApi.Webpack.getModule(filter, { defaultExport: resolve });
const byAnyName = (name, resolve = true) => resolveExport(find(byAnyName$1(name)), resolve ? byName(name) : null);
const byProps = (...props) => find(byProps$1(props));

const createLazy = () => {
    let controller = new AbortController();
    return {
        waitFor: (filter, resolve = true) => BdApi.Webpack.waitForModule(filter, { signal: controller.signal, defaultExport: resolve }),
        abort: () => {
            controller.abort();
            controller = new AbortController();
        }
    };
};

const createLogger = (name, color, version) => {
    const print = (output, ...data) => output(`%c[${name}] %c${version ? `(v${version})` : ""}`, `color: ${color}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
    return {
        print,
        log: (...data) => print(console.log, ...data),
        warn: (...data) => print(console.warn, ...data),
        error: (...data) => print(console.error, ...data)
    };
};

const resolveName = (object, method) => {
    const target = method === "default" ? object[method] : {};
    return object.displayName ?? object.constructor?.displayName ?? target.displayName ?? "unknown";
};
const createPatcher = (id, Logger) => {
    const forward = (patch, object, method, callback, options) => {
        const original = object?.[method];
        if (typeof original !== "function") {
            throw TypeError(`patch target ${original} is not a function`);
        }
        const cancel = patch(id, object, method, options.once ? (...args) => {
            const result = callback(cancel, original, ...args);
            cancel();
            return result;
        } : (...args) => callback(cancel, original, ...args));
        if (!options.silent) {
            Logger.log(`Patched ${String(method)} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };
    return {
        instead: (object, method, callback, options = {}) => forward(BdApi.Patcher.instead, object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        before: (object, method, callback, options = {}) => forward(BdApi.Patcher.before, object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        after: (object, method, callback, options = {}) => forward(BdApi.Patcher.after, object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options),
        unpatchAll: () => {
            if (BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};

const React = /* @__PURE__ */ byProps("createElement", "Component", "Fragment");
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Flux = /* @__PURE__ */ byProps("Store", "useStateFromStores");
const Dispatcher = /* @__PURE__ */ byProps("dispatch", "subscribe");

const MediaEngineStore = /* @__PURE__ */ byProps("getLocalVolume");

const UserStore = /* @__PURE__ */ byProps("getUser", "getCurrentUser");

const GuildMemberStore = /* @__PURE__ */ byProps("getMember", "isMember");

const ChannelStore = /* @__PURE__ */ byProps("getChannel", "hasChannel");
const SelectedChannelStore = /* @__PURE__ */ byProps("getChannelId", "getVoiceChannelId");

const Flex = /* @__PURE__ */ byAnyName("Flex");
const Button = /* @__PURE__ */ byProps("Link", "Hovers");
const Text = /* @__PURE__ */ byAnyName("Text");
const Switch = /* @__PURE__ */ byAnyName("Switch");
const SwitchItem = /* @__PURE__ */ byAnyName("SwitchItem");
const Slider = /* @__PURE__ */ byAnyName("Slider");
const TextInput = /* @__PURE__ */ byAnyName("TextInput");
const Menu = /* @__PURE__ */ byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form = /* @__PURE__ */ byProps("FormItem", "FormSection", "FormDivider");
const margins = /* @__PURE__ */ byProps("marginLarge");

class Settings extends Flux.Store {
    constructor(Data, defaults) {
        super(new Flux.Dispatcher(), {
            update: ({ settings }) => {
                Object.assign(this.current, settings);
                for (const listener of this.listeners) {
                    listener(this.current);
                }
                Data.save("settings", this.current);
            }
        });
        this.listeners = new Set();
        this.defaults = defaults;
        this.current = { ...defaults, ...Data.load("settings") };
    }
    dispatch(settings) {
        this._dispatcher.dispatch({
            type: "update",
            settings
        });
    }
    update(settings) {
        this.dispatch(typeof settings === "function" ? settings(this.current) : settings);
    }
    reset() {
        this.dispatch({ ...this.defaults });
    }
    delete(...keys) {
        const settings = { ...this.current };
        for (const key of keys) {
            delete settings[key];
        }
        this.dispatch(settings);
    }
    useCurrent() {
        return Flux.useStateFromStores([this], () => this.current);
    }
    useState() {
        return Flux.useStateFromStores([this], () => [this.current, (settings) => this.update(settings)]);
    }
    useStateWithDefaults() {
        return Flux.useStateFromStores([this], () => [this.current, this.defaults, (settings) => this.update(settings)]);
    }
    useListener(listener) {
        React.useEffect(() => {
            this.addListener(listener);
            return () => this.removeListener(listener);
        }, [listener]);
    }
    addListener(listener) {
        this.listeners.add(listener);
        return listener;
    }
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    removeAllListeners() {
        this.listeners.clear();
    }
}
const createSettings = (Data, defaults) => new Settings(Data, defaults);

const createStyles = (id) => {
    return {
        inject(styles) {
            if (typeof styles === "string") {
                BdApi.injectCSS(id, styles);
            }
        },
        clear: () => BdApi.clearCSS(id)
    };
};

const alert = (title, content) => BdApi.alert(title, content);
const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const createPlugin = (config, callback) => (meta) => {
    const name = config.name ?? meta.name;
    const version = config.version ?? meta.version;
    const Logger = createLogger(name, "#3a71c1", version);
    const Lazy = createLazy();
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData(name);
    const Settings = createSettings(Data, config.settings ?? {});
    const plugin = callback({ meta, Logger, Lazy, Patcher, Styles, Data, Settings });
    return {
        start() {
            Logger.log("Enabled");
            Styles.inject(config.styles);
            plugin.start();
        },
        stop() {
            Lazy.abort();
            Patcher.unpatchAll();
            Styles.clear();
            plugin.stop();
            Logger.log("Disabled");
        },
        getSettingsPanel: plugin.SettingsPanel ? () => (React.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React.createElement(plugin.SettingsPanel, null))) : null
    };
};

const { FormSection, FormTitle, FormItem, FormText, FormDivider } = Form;
const SingleSelect = byAnyName("SingleSelect");
const settings = {
    voice: null,
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
const titles = {
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
const VoiceLabel = ({ name, lang }) => (React.createElement(Flex, { direction: Flex.Direction.HORIZONTAL, align: Flex.Align.CENTER },
    React.createElement(Text, { variant: "text-md/normal" }, name),
    React.createElement(Text, { variant: "text-xs/semibold", style: { marginLeft: 8 } }, lang)));
const SettingsPanel = ({ current, defaults, onChange, speak }) => {
    const { voice, volume, speed, filterNames, filterBots, filterStages, ...settings } = current;
    return (React.createElement(React.Fragment, null,
        React.createElement(FormItem, { className: margins.marginBottom20 },
            React.createElement(FormTitle, null, "TTS Voice"),
            React.createElement(SingleSelect, { value: voice, onChange: (value) => onChange({ voice: value }), options: speechSynthesis.getVoices().map(({ name, lang, voiceURI }) => ({
                    value: voiceURI,
                    label: name,
                    lang
                })), renderOptionLabel: ({ label, lang }) => React.createElement(VoiceLabel, { name: label, lang: lang }), renderOptionValue: ([{ label, lang }]) => React.createElement(VoiceLabel, { name: label, lang: lang }) })),
        React.createElement(FormItem, { className: margins.marginBottom20 },
            React.createElement(FormTitle, null, "TTS Volume"),
            React.createElement(Slider, { initialValue: volume, maxValue: 100, minValue: 0, asValueChanges: (value) => onChange({ volume: value }) })),
        React.createElement(FormItem, { className: margins.marginBottom20 },
            React.createElement(FormTitle, null, "TTS Speed"),
            React.createElement(Slider, { initialValue: speed, maxValue: 10, minValue: 0.1, asValueChanges: (value) => onChange({ speed: value }), onValueRender: (value) => `${value.toFixed(2)}x`, markers: [0.1, 1, 2, 5, 10], onMarkerRender: (value) => `${value.toFixed(2)}x` })),
        React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
        React.createElement(FormItem, null,
            React.createElement(SwitchItem, { value: filterNames, onChange: (checked) => onChange({ filterNames: checked }), note: "Limit user & channel names to alphanumeric characters." }, "Enable Name Filter")),
        React.createElement(FormItem, null,
            React.createElement(SwitchItem, { value: filterBots, onChange: (checked) => onChange({ filterBots: checked }), note: "Disable notifications for bot users in voice." }, "Enable Bot Filter")),
        React.createElement(FormItem, null,
            React.createElement(SwitchItem, { value: filterStages, onChange: (checked) => onChange({ filterStages: checked }), note: "Disable notifications for stage voice channels." }, "Enable Stage Filter")),
        React.createElement(FormSection, null,
            React.createElement(FormTitle, { tag: "h3" }, "Notifications"),
            React.createElement(FormText, { type: "description", className: margins.marginBottom20 }, "$user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.")),
        Object.entries(titles).map(([key, title]) => (React.createElement(FormItem, { key: key, className: margins.marginBottom20 },
            React.createElement(FormTitle, null, title),
            React.createElement(Flex, { align: Flex.Align.CENTER },
                React.createElement(Flex.Child, { grow: 1 },
                    React.createElement("div", null,
                        React.createElement(TextInput, { value: settings.notifs[key].message, placeholder: defaults.notifs[key].message, onChange: (value) => {
                                const { notifs } = settings;
                                notifs[key].message = value;
                                onChange({ notifs });
                            } }))),
                React.createElement(Flex.Child, { grow: 0 },
                    React.createElement(Switch, { checked: settings.notifs[key].enabled, onChange: (value) => {
                            const { notifs } = settings;
                            notifs[key].enabled = value;
                            onChange({ notifs });
                        } })),
                React.createElement(Flex.Child, { grow: 0 },
                    React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => speak(settings.notifs[key].message
                            .split("$user").join("user")
                            .split("$channel").join("channel")) }, "Test")))))),
        React.createElement(FormItem, { key: "unknownChannel", className: margins.marginBottom20 },
            React.createElement(FormTitle, null, "Unknown Channel Name"),
            React.createElement(Flex, { align: Flex.Align.CENTER },
                React.createElement(Flex.Child, { grow: 1 },
                    React.createElement("div", null,
                        React.createElement(TextInput, { value: settings.unknownChannel, placeholder: defaults.unknownChannel, onChange: (value) => onChange({ unknownChannel: value }) }))),
                React.createElement(Flex.Child, { grow: 0 },
                    React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => speak(settings.unknownChannel) }, "Test"))))));
};

const VoiceStateStore = byProps("getVoiceStates", "hasVideo");
const { MenuItem } = Menu;
let prevStates = {};
const saveStates = () => {
    prevStates = { ...VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId()) };
};
const index = createPlugin({ settings }, ({ meta, Logger, Lazy, Patcher, Settings }) => {
    const loaded = Settings.current;
    for (const [key, value] of Object.entries(Settings.defaults.notifs)) {
        if (typeof loaded[key] === "string") {
            const { notifs } = Settings.current;
            notifs[key] = { ...value, message: loaded[key] };
            Settings.update({ notifs });
            Settings.delete(key);
        }
    }
    if (typeof loaded.privateCall === "string") {
        Settings.update({ unknownChannel: loaded.privateCall });
        Settings.delete("privateCall");
    }
    const findDefaultVoice = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            Logger.error("No speech synthesis voices available");
            alert(meta.name, React.createElement(Text, { color: Text.Colors.STANDARD },
                "Electron does not have any Speech Synthesis Voices available on your system.",
                React.createElement("br", null),
                "The plugin will be unable to function properly."));
            return null;
        }
        else {
            return voices.find((voice) => voice.lang === "en-US") ?? voices[0];
        }
    };
    Settings.defaults.voice = findDefaultVoice()?.voiceURI;
    if (Settings.current.voice === null) {
        Settings.update({ voice: Settings.defaults.voice });
    }
    const findCurrentVoice = () => {
        const uri = Settings.current.voice;
        const voice = speechSynthesis.getVoices().find((voice) => voice.voiceURI === uri);
        if (voice) {
            return voice;
        }
        else {
            Logger.warn(`Voice "${uri}" not found, reverting to default`);
            const defaultVoice = findDefaultVoice();
            Settings.update({ voice: defaultVoice.voiceURI });
            return defaultVoice;
        }
    };
    const speak = (message) => {
        const { volume, speed } = Settings.current;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = findCurrentVoice();
        utterance.volume = volume / 100;
        utterance.rate = speed;
        speechSynthesis.speak(utterance);
    };
    const processName = (name) => {
        return Settings.current.filterNames ? name.split("").map((char) => /[a-zA-Z0-9]/.test(char) ? char : " ").join("") : name;
    };
    const notify = (type, userId, channelId) => {
        const settings = Settings.current;
        if (!settings.notifs[type].enabled) {
            return;
        }
        const user = UserStore.getUser(userId);
        const channel = ChannelStore.getChannel(channelId);
        if (settings.filterBots && user?.bot
            || settings.filterStages && channel?.isGuildStageVoice()) {
            return;
        }
        const nick = GuildMemberStore.getMember(channel?.getGuildId(), userId)?.nick ?? user.username;
        const channelName = (!channel || channel.isDM() || channel.isGroupDM()) ? settings.unknownChannel : channel.name;
        speak(settings.notifs[type].message
            .split("$username").join(processName(user.username))
            .split("$user").join(processName(nick))
            .split("$channel").join(processName(channelName)));
    };
    const selfMuteHandler = () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfMute() ? "mute" : "unmute", userId, channelId);
    };
    const selfDeafHandler = () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
    };
    const voiceStateHandler = (action) => {
        for (const { userId, channelId } of action.voiceStates) {
            try {
                const prev = prevStates[userId];
                if (userId === UserStore.getCurrentUser().id) {
                    if (!channelId) {
                        notify("leaveSelf", userId, prev.channelId);
                        saveStates();
                    }
                    else if (!prev) {
                        notify("joinSelf", userId, channelId);
                        saveStates();
                    }
                    else if (channelId !== prev.channelId) {
                        notify("moveSelf", userId, channelId);
                        saveStates();
                    }
                }
                else {
                    const selectedChannelId = SelectedChannelStore.getVoiceChannelId();
                    if (!selectedChannelId) {
                        return;
                    }
                    if (!prev && channelId === selectedChannelId) {
                        notify("join", userId, channelId);
                        saveStates();
                    }
                    else if (prev && !VoiceStateStore.getVoiceStatesForChannel(selectedChannelId)[userId]) {
                        notify("leave", userId, selectedChannelId);
                        saveStates();
                    }
                }
            }
            catch (error) {
                Logger.error("Error processing voice state change, see details below");
                console.error(error);
            }
        }
    };
    return {
        async start() {
            saveStates();
            Dispatcher.subscribe("VOICE_STATE_UPDATES", voiceStateHandler);
            Logger.log("Subscribed to voice state actions");
            Dispatcher.subscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteHandler);
            Logger.log("Subscribed to self mute actions");
            Dispatcher.subscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafHandler);
            Logger.log("Subscribed to self deaf actions");
            const useChannelHideNamesItem = await Lazy.waitFor(byName("useChannelHideNamesItem"), false);
            Patcher.after(useChannelHideNamesItem, "default", ({ result }) => {
                if (result) {
                    return (React.createElement(React.Fragment, null,
                        result,
                        React.createElement(MenuItem, { isFocused: false, id: "voiceevents-clear", label: "Clear VoiceEvents queue", action: () => speechSynthesis.cancel() })));
                }
            });
        },
        stop() {
            prevStates = {};
            Dispatcher.unsubscribe("VOICE_STATE_UPDATES", voiceStateHandler);
            Logger.log("Unsubscribed from voice state actions");
            Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteHandler);
            Logger.log("Unsubscribed from self mute actions");
            Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafHandler);
            Logger.log("Unsubscribed from self deaf actions");
        },
        SettingsPanel: () => {
            const [current, defaults, setSettings] = Settings.useStateWithDefaults();
            return React.createElement(SettingsPanel, { current: current, defaults: defaults, onChange: setSettings, speak: speak });
        }
    };
});

module.exports = index;

/*@end @*/
