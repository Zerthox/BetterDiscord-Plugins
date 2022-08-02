/**
 * @name VoiceEvents
 * @author Zerthox
 * @version 2.2.4
 * @description Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/VoiceEvents
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/dist/bd/VoiceEvents.plugin.js
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

const createLogger = (name, color, version) => {
    const print = (output, ...data) => output(`%c[${name}] %c${version ? `(v${version})` : ""}`, `color: ${color}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
    return {
        print,
        log: (...data) => print(console.log, ...data),
        warn: (...data) => print(console.warn, ...data),
        error: (...data) => print(console.error, ...data)
    };
};

const join = (filters) => {
    const apply = filters.filter((filter) => filter instanceof Function);
    return (exports) => apply.every((filter) => filter(exports));
};
const generate = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? byName$1(name) : null,
    props instanceof Array ? byProps$1(props) : null,
    protos instanceof Array ? byProtos(protos) : null,
    source instanceof Array ? bySource(source) : null
];
const byName$1 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byOwnName(name));
};
const byOwnName = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byProps$1 = (props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos = (protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource = (contents) => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};

const raw = {
    single: (filter) => BdApi.findModule(filter),
    all: (filter) => BdApi.findAllModules(filter) ?? []
};
const resolveExports = (target, filter) => {
    if (target) {
        if (typeof filter === "string") {
            return target[filter];
        }
        else if (filter instanceof Function) {
            return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
        }
    }
    return target;
};
const find = (...filters) => raw.single(join(filters));
const query = (options) => resolveExports(find(...generate(options)), options.export);
const byName = (name) => resolveExports(find(byName$1(name)), byOwnName(name));
const byProps = (...props) => find(byProps$1(props));

const React = /* @__PURE__ */ byProps("createElement", "Component", "Fragment");
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Flux = /* @__PURE__ */ byProps("Store", "useStateFromStores");
const Dispatcher = /* @__PURE__ */ byProps("dirtyDispatch");

const ChannelStore = /* @__PURE__ */ byProps("getChannel", "hasChannel");
const SelectedChannelStore = /* @__PURE__ */ byProps("getChannelId", "getVoiceChannelId");
const UserStore = /* @__PURE__ */ byProps("getUser", "getCurrentUser");
const GuildMemberStore = /* @__PURE__ */ byProps("getMember", "isMember");
const MediaEngineStore = /* @__PURE__ */ byProps("getLocalVolume");
const ContextMenuActions = /* @__PURE__ */ byProps("openContextMenuLazy");
const ModalActions = /* @__PURE__ */ byProps("openModalLazy");
const Flex = /* @__PURE__ */ byName("Flex");
const Button = /* @__PURE__ */ byProps("Link", "Hovers");
const Text = /* @__PURE__ */ byName("Text");
const Switch = /* @__PURE__ */ byName("Switch");
const SwitchItem = /* @__PURE__ */ byName("SwitchItem");
const Slider = /* @__PURE__ */ byName("Slider");
const TextInput = /* @__PURE__ */ byName("TextInput");
const Menu = /* @__PURE__ */ byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form = /* @__PURE__ */ byProps("FormItem", "FormSection", "FormDivider");
const margins = /* @__PURE__ */ byProps("marginLarge");

const resolveName = (object, method) => {
    const target = method === "default" ? object[method] : {};
    return object.displayName ?? object.constructor?.displayName ?? target.displayName ?? "unknown";
};
const createPatcher = (id, Logger) => {
    const forward = (patcher, object, method, callback, options) => {
        const original = object[method];
        const cancel = patcher(id, object, method, options.once ? (context, args, result) => {
            const temp = callback({ cancel, original, context, args, result });
            cancel();
            return temp;
        } : (context, args, result) => callback({ cancel, original, context, args, result }), { silent: true });
        if (!options.silent) {
            Logger.log(`Patched ${String(method)} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };
    const rawPatcher = BdApi.Patcher;
    const patcher = {
        instead: (object, method, callback, options = {}) => forward(rawPatcher.instead, object, method, ({ result: _, ...data }) => callback(data), options),
        before: (object, method, callback, options = {}) => forward(rawPatcher.before, object, method, ({ result: _, ...data }) => callback(data), options),
        after: (object, method, callback, options = {}) => forward(rawPatcher.after, object, method, callback, options),
        unpatchAll: () => {
            if (rawPatcher.getPatchesByCaller(id).length > 0) {
                rawPatcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        },
        waitForLazy: (object, method, argIndex, callback) => new Promise((resolve) => {
            const found = callback();
            if (found) {
                resolve(found);
            }
            else {
                Logger.log(`Waiting for lazy load in ${String(method)} of ${resolveName(object, method)}`);
                patcher.before(object, method, ({ args, cancel }) => {
                    const original = args[argIndex];
                    args[argIndex] = async function (...args) {
                        const result = await original.call(this, ...args);
                        Promise.resolve().then(() => {
                            const found = callback();
                            if (found) {
                                resolve(found);
                                cancel();
                            }
                        });
                        return result;
                    };
                }, { silent: true });
            }
        }),
        waitForContextMenu: (callback) => patcher.waitForLazy(ContextMenuActions, "openContextMenuLazy", 1, callback),
        waitForModal: (callback) => patcher.waitForLazy(ModalActions, "openModalLazy", 0, callback)
    };
    return patcher;
};

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

const createData = (id) => ({
    load: (key) => BdApi.loadData(id, key) ?? null,
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});

class Settings extends Flux.Store {
    constructor(Data, defaults) {
        super(new Flux.Dispatcher(), {
            update: ({ current }) => Data.save("settings", current)
        });
        this.listeners = new Map();
        this.defaults = defaults;
        this.current = { ...defaults, ...Data.load("settings") };
    }
    dispatch() {
        this._dispatcher.dirtyDispatch({ type: "update", current: this.current });
    }
    update(settings) {
        Object.assign(this.current, settings instanceof Function ? settings(this.current) : settings);
        this.dispatch();
    }
    reset() {
        this.update({ ...this.defaults });
    }
    delete(...keys) {
        for (const key of keys) {
            delete this.current[key];
        }
        this.dispatch();
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
    addListener(listener) {
        const wrapper = ({ current }) => listener(current);
        this.listeners.set(listener, wrapper);
        this._dispatcher.subscribe("update", wrapper);
        return listener;
    }
    removeListener(listener) {
        const wrapper = this.listeners.get(listener);
        if (wrapper) {
            this._dispatcher.unsubscribe("update", wrapper);
            this.listeners.delete(listener);
        }
    }
    removeAllListeners() {
        for (const wrapper of this.listeners.values()) {
            this._dispatcher.unsubscribe("update", wrapper);
        }
        this.listeners.clear();
    }
}
const createSettings = (Data, defaults) => new Settings(Data, defaults);

const alert = (title, content) => BdApi.alert(title, content);
const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const createPlugin = ({ name, version, styles, settings }, callback) => {
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData(name);
    const Settings = createSettings(Data, settings ?? {});
    const plugin = callback({ Logger, Patcher, Styles, Data, Settings });
    class Wrapper {
        start() {
            Logger.log("Enabled");
            Styles.inject(styles);
            plugin.start();
        }
        stop() {
            Patcher.unpatchAll();
            Styles.clear();
            plugin.stop();
            Logger.log("Disabled");
        }
    }
    if (plugin.SettingsPanel) {
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React.createElement(plugin.SettingsPanel, null)));
    }
    return Wrapper;
};

const { FormSection, FormTitle, FormItem, FormText, FormDivider } = Form;
const SingleSelect = byName("SingleSelect");
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
                    React.createElement(Switch, { className: margins.marginRight20, checked: settings.notifs[key].enabled, onChange: (value) => {
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

const name = "VoiceEvents";
const author = "Zerthox";
const version = "2.2.4";
const description = "Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const VoiceStateStore = byProps("getVoiceStates", "hasVideo");
const { MenuItem } = Menu;
let prevStates = {};
const saveStates = () => {
    prevStates = { ...VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId()) };
};
const index = createPlugin({ ...config, settings }, ({ Logger, Patcher, Settings }) => {
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
            alert(config.name, React.createElement(Text, { color: Text.Colors.STANDARD },
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
    const selfMuteListener = () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfMute() ? "mute" : "unmute", userId, channelId);
    };
    const selfDeafListener = () => {
        const userId = UserStore.getCurrentUser().id;
        const channelId = SelectedChannelStore.getVoiceChannelId();
        notify(MediaEngineStore.isSelfDeaf() ? "deafen" : "undeafen", userId, channelId);
    };
    const voiceStateListener = (event) => {
        for (const { userId, channelId } of event.voiceStates) {
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
            Dispatcher.subscribe("VOICE_STATE_UPDATES", voiceStateListener);
            Logger.log("Subscribed to voice state events");
            Dispatcher.subscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteListener);
            Logger.log("Subscribed to self mute events");
            Dispatcher.subscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafListener);
            Logger.log("Subscribed to self deaf events");
            const useChannelHideNamesItem = await Patcher.waitForContextMenu(() => query({ name: "useChannelHideNamesItem" }));
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
            Dispatcher.unsubscribe("VOICE_STATE_UPDATES", voiceStateListener);
            Logger.log("Unsubscribed from voice state events");
            Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_MUTE", selfMuteListener);
            Logger.log("Unsubscribed from self mute events");
            Dispatcher.unsubscribe("AUDIO_TOGGLE_SELF_DEAF", selfDeafListener);
            Logger.log("Unsubscribed from self deaf events");
        },
        SettingsPanel: () => {
            const [current, defaults, setSettings] = Settings.useStateWithDefaults();
            return React.createElement(SettingsPanel, { current: current, defaults: defaults, onChange: setSettings, speak: speak });
        }
    };
});

module.exports = index;

/*@end @*/
