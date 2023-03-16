/**
 * @name BetterVolume
 * @version 2.4.0
 * @author Zerthox
 * @authorLink https://github.com/Zerthox
 * @description Set user volume values manually instead of using a slider. Allows setting volumes higher than 200%.
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/BetterVolume
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

let meta = null;
const getMeta = () => {
    if (meta) {
        return meta;
    }
    else {
        throw Error("Accessing meta before initialization");
    }
};
const setMeta = (newMeta) => {
    meta = newMeta;
};

const load = (key) => BdApi.Data.load(getMeta().name, key);
const save = (key, value) => BdApi.Data.save(getMeta().name, key, value);

const byName$1 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byKeys$1 = (...keys) => {
    return (target) => target instanceof Object && keys.every((key) => key in target);
};
const byProtos = (...protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource$1 = (...fragments) => {
    return (target) => {
        while (target instanceof Object && "$$typeof" in target) {
            target = target.render ?? target.type;
        }
        if (target instanceof Function) {
            const source = target.toString();
            const renderSource = target.prototype?.render?.toString();
            return fragments.every((fragment) => typeof fragment === "string" ? (source.includes(fragment) || renderSource?.includes(fragment)) : (fragment(source) || renderSource && fragment(renderSource)));
        }
        else {
            return false;
        }
    };
};

const confirm = (title, content, options = {}) => BdApi.UI.showConfirmationModal(title, content, options);
const mappedProxy = (target, mapping) => {
    const map = new Map(Object.entries(mapping));
    return new Proxy(target, {
        get(target, prop) {
            return target[map.get(prop) ?? prop];
        },
        set(target, prop, value) {
            target[map.get(prop) ?? prop] = value;
            return true;
        },
        deleteProperty(target, prop) {
            delete target[map.get(prop) ?? prop];
            map.delete(prop);
            return true;
        },
        has(target, prop) {
            return map.has(prop) || prop in target;
        },
        ownKeys() {
            return [...map.keys(), ...Object.keys(target)];
        },
        getOwnPropertyDescriptor(target, prop) {
            return Object.getOwnPropertyDescriptor(target, map.get(prop) ?? prop);
        },
        defineProperty(target, prop, attributes) {
            Object.defineProperty(target, map.get(prop) ?? prop, attributes);
            return true;
        }
    });
};

const find = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});
const byName = (name, options) => find(byName$1(name), options);
const byKeys = (keys, options) => find(byKeys$1(...keys), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
const resolveKey = (target, filter) => [target, Object.entries(target ?? {}).find(([, value]) => filter(value))?.[0]];
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find((target) => (target instanceof Object
        && target !== window
        && req.every((req) => Object.values(target).some((value) => mapping[req](value)))));
    return proxy ? mappedProxy(found, Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        Object.entries(found ?? {}).find(([, value]) => filter(value))?.[0]
    ]))) : Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        Object.values(found ?? {}).find((value) => filter(value))
    ]));
};
let controller = new AbortController();
const waitFor = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.waitForModule(filter, {
    signal: controller.signal,
    defaultExport: resolve,
    searchExports: entries
});
const abort = () => {
    controller.abort();
    controller = new AbortController();
};

const COLOR = "#3a71c1";
const print = (output, ...data) => output(`%c[${getMeta().name}] %c${getMeta().version ? `(v${getMeta().version})` : ""}`, `color: ${COLOR}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
const log = (...data) => print(console.log, ...data);

const patch = (type, object, method, callback, options) => {
    const original = object?.[method];
    if (!(original instanceof Function)) {
        throw TypeError(`patch target ${original} is not a function`);
    }
    const cancel = BdApi.Patcher[type](getMeta().name, object, method, options.once ? (...args) => {
        const result = callback(cancel, original, ...args);
        cancel();
        return result;
    } : (...args) => callback(cancel, original, ...args));
    if (!options.silent) {
        log(`Patched ${options.name ?? String(method)}`);
    }
    return cancel;
};
const after = (object, method, callback, options = {}) => patch("after", object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options);
let menuPatches = [];
const unpatchAll = () => {
    if (menuPatches.length + BdApi.Patcher.getPatchesByCaller(getMeta().name).length > 0) {
        for (const cancel of menuPatches) {
            cancel();
        }
        menuPatches = [];
        BdApi.Patcher.unpatchAll(getMeta().name);
        log("Unpatched all");
    }
};

const inject = (styles) => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
    }
};
const clear = () => BdApi.DOM.removeStyle(getMeta().name);

const MediaEngineStore = /* @__PURE__ */ byName("MediaEngineStore");
const MediaEngineActions = /* @__PURE__ */ byKeys(["setLocalVolume"]);

const ExperimentStore = /* @__PURE__ */ byName("ExperimentStore");

const Flux = /* @__PURE__ */ demangle({
    default: byKeys$1("Store", "connectStores"),
    Dispatcher: byProtos("dispatch"),
    Store: byProtos("emitChange"),
    BatchedStoreListener: byProtos("attach", "detach"),
    useStateFromStores: bySource$1("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

const { React } = BdApi;
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Button = /* @__PURE__ */ byKeys(["Colors", "Link"], { entries: true });

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$1(".titleClassName", ".sectionTitle"),
    FormItem: bySource$1(".titleClassName", ".required"),
    FormTitle: bySource$1(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$1(".divider", ".style"),
    FormNotice: bySource$1(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormDivider"]);

const { Menu: Menu, Group: MenuGroup, Item: MenuItem, Separator: MenuSeparator, CheckboxItem: MenuCheckboxItem, RadioItem: MenuRadioItem, ControlItem: MenuControlItem } = BdApi.ContextMenu;

const { SwitchItem, Switch } = /* @__PURE__ */ demangle({
    SwitchItem: bySource$1(".tooltipNote"),
    Switch: byName$1("withDefaultColorContext()")
});

const Text = /* @__PURE__ */ bySource([".lineClamp", ".variant"], { entries: true });

const margins = /* @__PURE__ */ byKeys(["marginLarge"]);

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(FormSection, null,
    children,
    onReset ? (React.createElement(React.Fragment, null,
        React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
        React.createElement(Flex, { justify: Flex.Justify.END },
            React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                    onConfirm: () => onReset()
                }) }, "Reset")))) : null));

class SettingsStore extends Flux.Store {
    constructor(defaults, onLoad) {
        super(new Flux.Dispatcher(), {
            update: () => {
                for (const listener of this.listeners) {
                    listener(this.current);
                }
            }
        });
        this.listeners = new Set();
        this.defaults = defaults;
        this.onLoad = onLoad;
    }
    load() {
        this.current = { ...this.defaults, ...load("settings") };
        this.onLoad?.();
        this._dispatch(false);
    }
    _dispatch(save$1) {
        this._dispatcher.dispatch({ type: "update" });
        if (save$1) {
            save("settings", this.current);
        }
    }
    update(settings) {
        Object.assign(this.current, typeof settings === "function" ? settings(this.current) : settings);
        this._dispatch(true);
    }
    reset() {
        this.current = { ...this.defaults };
        this._dispatch(true);
    }
    delete(...keys) {
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch(true);
    }
    useCurrent() {
        return Flux.useStateFromStores([this], () => this.current, undefined, () => false);
    }
    useSelector(selector, deps, compare) {
        return Flux.useStateFromStores([this], () => selector(this.current), deps, compare);
    }
    useState() {
        return Flux.useStateFromStores([this], () => [
            this.current,
            (settings) => this.update(settings)
        ]);
    }
    useStateWithDefaults() {
        return Flux.useStateFromStores([this], () => [
            this.current,
            this.defaults,
            (settings) => this.update(settings)
        ]);
    }
    useListener(listener, deps) {
        React.useEffect(() => {
            this.addListener(listener);
            return () => this.removeListener(listener);
        }, deps ?? [listener]);
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
const createSettings = (defaults, onLoad) => new SettingsStore(defaults, onLoad);

const createPlugin = (plugin) => (meta) => {
    setMeta(meta);
    const { start, stop, styles, Settings, SettingsPanel } = (plugin instanceof Function ? plugin(meta) : plugin);
    Settings?.load();
    return {
        start() {
            log("Enabled");
            inject(styles);
            start?.();
        },
        stop() {
            abort();
            unpatchAll();
            clear();
            stop?.();
            log("Disabled");
        },
        getSettingsPanel: SettingsPanel ? () => (React.createElement(SettingsContainer, { name: meta.name, onReset: Settings ? () => Settings.reset() : null },
            React.createElement(SettingsPanel, null))) : null
    };
};

const css = ".container-BetterVolume {\n  margin: 0 8px;\n  padding: 3px 6px;\n  background: var(--background-primary);\n  border-radius: 3px;\n  display: flex;\n}\n\n.input-BetterVolume {\n  margin-right: 2px;\n  flex-grow: 1;\n  background: transparent;\n  border: none;\n  color: var(--interactive-normal);\n  font-weight: 500;\n}\n.input-BetterVolume:hover::-webkit-inner-spin-button {\n  appearance: auto;\n}";
const styles = {
    container: "container-BetterVolume",
    input: "input-BetterVolume",
    unit: "unit-BetterVolume"
};

const limit = (input, min, max) => Math.min(Math.max(input, min), max);
const NumberInput = ({ value, min, max, fallback, onChange }) => {
    const [isEmpty, setEmpty] = React.useState(false);
    return (React.createElement("div", { className: styles.container },
        React.createElement("input", { type: "number", className: styles.input, min: min, max: max, value: !isEmpty ? Math.round((value + Number.EPSILON) * 100) / 100 : "", onChange: ({ target }) => {
                const value = limit(parseFloat(target.value), min, max);
                const isNaN = Number.isNaN(value);
                setEmpty(isNaN);
                if (!isNaN) {
                    onChange(value);
                }
            }, onBlur: () => {
                if (isEmpty) {
                    setEmpty(false);
                    onChange(fallback);
                }
            } }),
        React.createElement("span", { className: styles.unit }, "%")));
};

const AudioConvert = demangle({
    amplitudeToPerceptual: bySource$1("Math.log10"),
    perceptualToAmplitude: bySource$1("Math.pow(10")
});
const AUDIO_EXPERIMENT = "2022-09_remote_audio_settings";
const initialAudioBucket = ExperimentStore.getUserExperimentBucket(AUDIO_EXPERIMENT);
const hasAudioExperiment = initialAudioBucket > 0;
const setAudioBucket = (bucket) => {
    const audioExperiment = ExperimentStore.getUserExperimentDescriptor(AUDIO_EXPERIMENT);
    if (audioExperiment) {
        audioExperiment.bucket = bucket;
    }
};
const Settings = createSettings({
    disableExperiment: null
});
Settings.addListener(({ disableExperiment }) => setAudioBucket(disableExperiment ? 0 : initialAudioBucket));
const index = createPlugin({
    start() {
        if (hasAudioExperiment) {
            if (Settings.current.disableExperiment === null) {
                Settings.update({ disableExperiment: false });
                confirm(getMeta().name, (React.createElement(Text, { color: "text-normal" }, "Your client has an experiment interfering with volumes greater than 200% enabled. Do you wish to disable it now and on future restarts?")), {
                    onConfirm: () => Settings.update({ disableExperiment: true })
                });
            }
            if (Settings.current.disableExperiment) {
                setAudioBucket(0);
            }
        }
        const useUserVolumeItemFilter = bySource$1("user-volume");
        waitFor(useUserVolumeItemFilter, { resolve: false }).then((result) => {
            const useUserVolumeItem = resolveKey(result, useUserVolumeItemFilter);
            after(...useUserVolumeItem, ({ args: [userId, context], result }) => {
                if (result) {
                    const volume = MediaEngineStore.getLocalVolume(userId, context);
                    return (React.createElement(React.Fragment, null,
                        result,
                        React.createElement(MenuItem, { id: "user-volume-input", render: () => (React.createElement(NumberInput, { value: AudioConvert.amplitudeToPerceptual(volume), min: 0, max: 999999, fallback: 100, onChange: (value) => MediaEngineActions.setLocalVolume(userId, AudioConvert.perceptualToAmplitude(value), context) })) })));
                }
            }, { name: "useUserVolumeItem" });
        });
    },
    stop() {
        if (Settings.current.disableExperiment) {
            setAudioBucket(initialAudioBucket);
        }
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{ disableExperiment }, setSettings] = Settings.useState();
        return (React.createElement(SwitchItem, { note: "Force disable experiment interfering with volumes greater than 200%.", hideBorder: true, value: disableExperiment, disabled: !hasAudioExperiment, onChange: (checked) => setSettings({ disableExperiment: checked }) }, "Disable Audio experiment"));
    }
});

module.exports = index;

/*@end @*/
