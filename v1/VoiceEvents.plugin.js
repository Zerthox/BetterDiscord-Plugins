/**
 * @name VoiceEvents
 * @author Zerthox
 * @version 2.1.1
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
    return (target) => target instanceof Object && Object.values(target).some(byOwnName(name));
};
const byOwnName = (name) => {
    return (target) => target?.displayName === name || target?.constructor?.displayName === name;
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
    all: (filter) => BdApi.findAllModules(filter)
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

const EventEmitter = () => byProps("subscribe", "emit");
const React$1 = () => byProps("createElement", "Component", "Fragment");
const ReactDOM$1 = () => byProps("render", "findDOMNode", "createPortal");
const classNames$1 = () => find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const lodash$1 = () => byProps("cloneDeep", "flattenDeep");
const semver = () => byProps("valid", "satifies");
const moment = () => byProps("utc", "months");
const SimpleMarkdown = () => byProps("parseBlock", "parseInline");
const hljs = () => byProps("highlight", "highlightBlock");
const Raven = () => byProps("captureBreadcrumb");
const joi = () => byProps("assert", "validate", "object");

const npm = {
    __proto__: null,
    EventEmitter: EventEmitter,
    React: React$1,
    ReactDOM: ReactDOM$1,
    classNames: classNames$1,
    lodash: lodash$1,
    semver: semver,
    moment: moment,
    SimpleMarkdown: SimpleMarkdown,
    hljs: hljs,
    Raven: Raven,
    joi: joi
};

const Flux$1 = () => byProps("Store", "useStateFromStores");
const Events$1 = () => byProps("dirtyDispatch");

const flux = {
    __proto__: null,
    Flux: Flux$1,
    Events: Events$1
};

const Constants = () => byProps("Permissions", "RelationshipTypes");
const i18n = () => byProps("languages", "getLocale");
const Channels$1 = () => byProps("getChannel", "hasChannel");
const SelectedChannel$1 = () => byProps("getChannelId", "getVoiceChannelId");
const Users$1 = () => byProps("getUser", "getCurrentUser");
const Members$1 = () => byProps("getMember", "isMember");
const ContextMenuActions = () => byProps("openContextMenuLazy");
const ModalActions = () => byProps("openModalLazy");
const Flex$2 = () => byName("Flex");
const Button$2 = () => byProps("Link", "Hovers");
const Menu = () => byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form$1 = () => byProps("FormItem", "FormSection", "FormDivider");
const margins$2 = () => byProps("marginLarge");

const discord = {
    __proto__: null,
    Constants: Constants,
    i18n: i18n,
    Channels: Channels$1,
    SelectedChannel: SelectedChannel$1,
    Users: Users$1,
    Members: Members$1,
    ContextMenuActions: ContextMenuActions,
    ModalActions: ModalActions,
    Flex: Flex$2,
    Button: Button$2,
    Menu: Menu,
    Form: Form$1,
    margins: margins$2
};

const createProxy = (entries) => {
    const result = {};
    for (const [key, value] of Object.entries(entries)) {
        Object.defineProperty(result, key, {
            enumerable: true,
            configurable: true,
            get() {
                delete this[key];
                this[key] = value();
                return this[key];
            }
        });
    }
    return result;
};
const Modules = createProxy({
    ...npm,
    ...flux,
    ...discord
});
const { React, ReactDOM, classNames, lodash, Flux } = Modules;

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
            Logger.log(`Patched ${method} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };
    const rawPatcher = BdApi.Patcher;
    const patcher = {
        instead: (object, method, callback, options = {}) => forward(rawPatcher.instead, object, method, ({ result: _, ...data }) => callback(data), options),
        before: (object, method, callback, options = {}) => forward(rawPatcher.before, object, method, ({ result: _, ...data }) => callback(data), options),
        after: (object, method, callback, options = {}) => forward(rawPatcher.after, object, method, callback, options),
        unpatchAll: () => {
            rawPatcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        waitForLazy: (object, method, arg, callback) => new Promise((resolve) => {
            const found = callback();
            if (found) {
                resolve(found);
            }
            else {
                Logger.log(`Waiting for lazy load in ${method} of ${resolveName(object, method)}`);
                patcher.before(object, method, ({ args, cancel }) => {
                    const original = args[arg];
                    args[arg] = async (...args) => {
                        const result = await original(...args);
                        const found = callback();
                        if (found) {
                            resolve(found);
                            cancel();
                        }
                        return result;
                    };
                }, { silent: true });
            }
        }),
        waitForContextMenu: (callback) => patcher.waitForLazy(Modules.ContextMenuActions, "openContextMenuLazy", 1, callback),
        waitForModal: (callback) => patcher.waitForLazy(Modules.ModalActions, "openModalLazy", 0, callback)
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
    get() {
        return { ...this.current };
    }
    set(settings) {
        Object.assign(this.current, settings instanceof Function ? settings(this.get()) : settings);
        this._dispatcher.dispatch({ type: "update", current: this.current });
    }
    reset() {
        this.set({ ...this.defaults });
    }
    connect(component) {
        return Flux.default.connectStores([this], () => ({ ...this.get(), defaults: this.defaults, set: (settings) => this.set(settings) }))(component);
    }
    useCurrent() {
        return Flux.useStateFromStores([this], () => this.get());
    }
    useState() {
        return Flux.useStateFromStores([this], () => [this.get(), (settings) => this.set(settings)]);
    }
    useStateWithDefaults() {
        return Flux.useStateFromStores([this], () => [this.get(), this.defaults, (settings) => this.set(settings)]);
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

const { Flex: Flex$1, Button: Button$1, Form, margins: margins$1 } = Modules;
const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins$1.marginTop20, margins$1.marginBottom20) }),
    React.createElement(Flex$1, { justify: Flex$1.Justify.END },
        React.createElement(Button$1, { size: Button$1.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const createPlugin = ({ name, version, styles: css, settings }, callback) => {
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData(name);
    const Settings = createSettings(Data, settings ?? {});
    const plugin = callback({ Logger, Patcher, Styles, Data, Settings });
    function Wrapper() { }
    Wrapper.prototype.start = () => {
        Logger.log("Enabled");
        Styles.inject(css);
        plugin.start();
    };
    Wrapper.prototype.stop = () => {
        Patcher.unpatchAll();
        Styles.clear();
        plugin.stop();
        Logger.log("Disabled");
    };
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React.createElement(ConnectedSettings, null)));
    }
    return Wrapper;
};

const Flex = byName("Flex");
const Text$1 = byName("Text");
const Button = byProps("Link", "Hovers");
const { FormSection, FormTitle, FormItem, FormText, FormDivider } = byProps("FormSection", "FormText") ?? {};
const SwitchItem = byName("SwitchItem");
const TextInput = byName("TextInput");
const SelectTempWrapper = byName("SelectTempWrapper");
const Slider = byName("Slider");
const margins = byProps("marginLarge");
const settings = {
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
const SettingsPanel = ({ speak, defaults, set, voice, volume, speed, filterNames, filterBots, filterStages, ...settings }) => (React.createElement(React.Fragment, null,
    React.createElement(FormItem, { className: margins.marginBottom20 },
        React.createElement(FormTitle, null, "TTS Voice"),
        React.createElement(SelectTempWrapper, { value: voice, searchable: false, clearable: false, onChange: ({ value }) => set({ voice: value }), options: speechSynthesis.getVoices().map(({ name, lang, voiceURI }) => ({
                value: voiceURI,
                label: (React.createElement(Flex, null,
                    React.createElement(Text$1, { style: { marginRight: 4 } }, name),
                    React.createElement(Text$1, { color: Text$1.Colors.MUTED },
                        "[",
                        lang,
                        "]")))
            })) })),
    React.createElement(FormItem, { className: margins.marginBottom20 },
        React.createElement(FormTitle, null, "TTS Volume"),
        React.createElement(Slider, { initialValue: volume, maxValue: 100, minValue: 0, asValueChanges: (value) => set({ volume: value }) })),
    React.createElement(FormItem, { className: margins.marginBottom20 },
        React.createElement(FormTitle, null, "TTS Speed"),
        React.createElement(Slider, { initialValue: speed, maxValue: 10, minValue: 0.1, asValueChanges: (value) => set({ speed: value }), onValueRender: (value) => `${value.toFixed(2)}x`, markers: [0.1, 1, 2, 5, 10], onMarkerRender: (value) => `${value.toFixed(2)}x` })),
    React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(FormItem, null,
        React.createElement(SwitchItem, { value: filterNames, onChange: (checked) => set({ filterNames: checked }), note: "Limit user & channel names to alphanumeric characters." }, "Enable Name Filter")),
    React.createElement(FormItem, null,
        React.createElement(SwitchItem, { value: filterBots, onChange: (checked) => set({ filterBots: checked }), note: "Disable notifications for bot users in voice." }, "Enable Bot Filter")),
    React.createElement(FormItem, null,
        React.createElement(SwitchItem, { value: filterStages, onChange: (checked) => set({ filterStages: checked }), note: "Disable notifications for stage voice channels." }, "Enable Stage Filter")),
    React.createElement(FormSection, null,
        React.createElement(FormTitle, { tag: "h3" }, "Messages"),
        React.createElement(FormText, { type: "description", className: margins.marginBottom20 }, "$user will get replaced with the respective User Nickname, $username with the User Account name and $channel with the respective Voice Channel name.")),
    ([
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
    ]).map(({ title, setting }, i) => (React.createElement(FormItem, { key: i, className: margins.marginBottom20 },
        React.createElement(FormTitle, null, title),
        React.createElement(Flex, { align: Flex.Align.CENTER },
            React.createElement("div", { style: { flexGrow: 1, marginRight: 20 } },
                React.createElement(TextInput, { value: settings[setting], placeholder: defaults[setting], onChange: (value) => set({ [setting]: value }) })),
            React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => speak(settings[setting]
                    .split("$user").join("user")
                    .split("$channel").join("channel")) }, "Test")))))));

const name = "VoiceEvents";
const author = "Zerthox";
const version = "2.1.1";
const description = "Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const { Events, Channels, SelectedChannel, Users, Members } = Modules;
const { ActionTypes } = Modules.Constants;
const VoiceStates = byProps("getVoiceStates", "hasVideo");
const Text = byName("Text");
const { MenuItem } = Modules.Menu;
let prevStates = {};
const saveStates = () => {
    prevStates = { ...VoiceStates.getVoiceStatesForChannel(SelectedChannel.getVoiceChannelId()) };
};
const index = createPlugin({ ...config, settings }, ({ Logger, Patcher, Settings }) => {
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
    if (Settings.get().voice === null) {
        Settings.set({ voice: Settings.defaults.voice });
    }
    const findCurrentVoice = () => {
        const uri = Settings.get().voice;
        const voice = speechSynthesis.getVoices().find((voice) => voice.voiceURI === uri);
        if (voice) {
            return voice;
        }
        else {
            Logger.warn(`Voice "${uri}" not found, reverting to default`);
            const defaultVoice = findDefaultVoice();
            Settings.set({ voice: defaultVoice.voiceURI });
            return defaultVoice;
        }
    };
    const speak = (message) => {
        const { volume, speed } = Settings.get();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.voice = findCurrentVoice();
        utterance.volume = volume / 100;
        utterance.rate = speed;
        speechSynthesis.speak(utterance);
    };
    const processName = (name) => {
        return Settings.get().filterNames ? name.split("").map((char) => /[a-zA-Z0-9]/.test(char) ? char : " ").join("") : name;
    };
    const notify = (type, userId, channelId) => {
        const settings = Settings.get();
        const user = Users.getUser(userId);
        const channel = Channels.getChannel(channelId);
        const isDM = channel.isDM() || channel.isGroupDM();
        if (settings.filterBots && user.bot
            || settings.filterStages && channel.isGuildStageVoice()) {
            return;
        }
        const nick = Members.getMember(channel.getGuildId(), userId)?.nick ?? user.username;
        const channelName = isDM ? settings.privateCall : channel.name;
        speak(settings[type]
            .split("$username").join(processName(user.username))
            .split("$user").join(processName(nick))
            .split("$channel").join(processName(channelName)));
    };
    const listener = (event) => {
        for (const { userId, channelId } of event.voiceStates) {
            try {
                const prev = prevStates[userId];
                if (userId === Users.getCurrentUser().id) {
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
                    const selectedChannelId = SelectedChannel.getVoiceChannelId();
                    if (!selectedChannelId) {
                        return;
                    }
                    if (!prev && channelId === selectedChannelId) {
                        notify("join", userId, channelId);
                        saveStates();
                    }
                    else if (prev && !VoiceStates.getVoiceStatesForChannel(selectedChannelId)[userId]) {
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
            Events.subscribe(ActionTypes.VOICE_STATE_UPDATES, listener);
            Logger.log("Subscribed to voice state updates");
            const useChannelHideNamesItem = await Patcher.waitForContextMenu(() => query({ name: "useChannelHideNamesItem" }));
            Patcher.after(useChannelHideNamesItem, "default", ({ result }) => {
                if (result) {
                    return (React.createElement(React.Fragment, null,
                        result,
                        React.createElement(MenuItem, { isFocused: false, id: "voiceevents-clear", label: "Clear notification queue", action: () => speechSynthesis.cancel() })));
                }
            });
        },
        stop() {
            prevStates = {};
            Events.unsubscribe(ActionTypes.VOICE_STATE_UPDATES, listener);
            Logger.log("Unsubscribed from voice state updates");
        },
        settingsPanel: (props) => React.createElement(SettingsPanel, { speak: speak, ...props })
    };
});

module.exports = index;

/*@end @*/
