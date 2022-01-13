/**
 * @name BetterVolume
 * @author Zerthox
 * @version 2.2.0
 * @description Set user volume values manually instead of using a limited slider.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/BetterVolume
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/dist/bd/BetterVolume.plugin.js
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

const byName$2 = (name) => {
    return (target) => target instanceof Object && Object.values(target).some(byDisplayName(name));
};
const byDisplayName = (name) => {
    return (target) => target?.displayName === name || target?.constructor?.displayName === name;
};
const byProps$2 = (props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos = (protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource = (contents) => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};

const getWebpackRequire = () => {
    const moduleId = "discordium";
    let webpackRequire;
    global.webpackJsonp.push([[], {
            [moduleId]: (_module, _exports, require) => {
                webpackRequire = require;
            }
        }, [[moduleId]]]);
    delete webpackRequire.m[moduleId];
    delete webpackRequire.c[moduleId];
    return webpackRequire;
};
const joinFilters = (filters) => {
    return (module) => {
        const { exports } = module;
        return (filters.every((filter) => filter(exports, module))
            || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module)));
    };
};
const genFilters = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? byName$2(name) : null,
    props instanceof Array ? byProps$2(props) : null,
    protos instanceof Array ? byProtos(protos) : null,
    source instanceof Array ? bySource(source) : null
].filter((entry) => entry instanceof Function);
const webpackRequire = getWebpackRequire();
const getAll = () => Object.values(webpackRequire.c);
const find$1 = (...filters) => /*@__PURE__*/ getAll().find(joinFilters(filters)) ?? null;
const query$1 = (options) => /*@__PURE__*/ find$1(...genFilters(options));
const byName$1 = (name) => /*@__PURE__*/ find$1(byName$2(name));
const byProps$1 = (...props) => /*@__PURE__*/ find$1(byProps$2(props));
const resolveExports = (module, options = {}) => {
    if (module instanceof Object && "exports" in module) {
        const exported = module.exports;
        if (!exported) {
            return exported;
        }
        const hasDefault = exported.__esModule && "default" in exported;
        if (options.export) {
            return exported[options.export];
        }
        else if (options.name) {
            return Object.values(exported).find(byDisplayName(options.name));
        }
        else if (options.filter && hasDefault && options.filter(exported.default)) {
            return exported.default;
        }
        if (hasDefault && Object.keys(exported).length === 1) {
            return exported.default;
        }
        else {
            return exported;
        }
    }
    return null;
};

const find = (...filters) => resolveExports(/*@__PURE__*/ find$1(...filters));
const query = (options) => resolveExports(/*@__PURE__*/ query$1(options), { export: options.export });
const byName = (name) => resolveExports(/*@__PURE__*/ byName$1(name), { name });
const byProps = (...props) => resolveExports(/*@__PURE__*/ byProps$1(...props), { filter: byProps$2(props) });

const React = /*@__PURE__*/ byProps("createElement", "Component", "Fragment");
const classNames = /*@__PURE__*/ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Dispatch = /*@__PURE__*/ query({ props: ["default", "Dispatcher"], filter: (exports) => exports instanceof Object && !("ActionBase" in exports) });

const Flux = /*@__PURE__*/ byProps("Store", "useStateFromStores");

const ContextMenuActions = /*@__PURE__*/ byProps("openContextMenuLazy");
const ModalActions = /*@__PURE__*/ byProps("openModalLazy");
const Flex = /*@__PURE__*/ byName("Flex");
const Button = /*@__PURE__*/ byProps("Link", "Hovers");
const Menu = /*@__PURE__*/ byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form = /*@__PURE__*/ byProps("FormItem", "FormSection", "FormDivider");
const margins = /*@__PURE__*/ byProps("marginLarge");

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
        super(new Dispatch.Dispatcher(), {
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

const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
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

const name = "BetterVolume";
const author = "Zerthox";
const version = "2.2.0";
const description = "Set user volume values manually instead of using a limited slider.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const styles = ".container-BetterVolume {\n  margin: 0px 8px;\n  padding: 3px 6px;\n  background: var(--background-primary);\n  border-radius: 3px;\n  display: flex;\n}\n\n.input-BetterVolume {\n  margin-right: 2px;\n  flex-grow: 1;\n  background: transparent;\n  border: none;\n  color: var(--interactive-normal);\n  font-weight: 500;\n}";

const { MenuItem } = Menu;
const SettingsStore = /*@__PURE__*/ byProps("getLocalVolume");
const SettingsActions = /*@__PURE__*/ byProps("setLocalVolume");
const AudioConvert = /*@__PURE__*/ byProps("perceptualToAmplitude");
const NumberInput = ({ value, min, max, onChange }) => (React.createElement("div", { className: "container-BetterVolume" },
    React.createElement("input", { type: "number", min: min, max: max, value: Math.round((value + Number.EPSILON) * 100) / 100, onChange: ({ target }) => onChange(Math.min(Math.max(parseFloat(target.value), min), max)), className: "input-BetterVolume" }),
    React.createElement("span", { className: "unit-BetterVolume" }, "%")));
const index = createPlugin({ ...config, styles }, ({ Patcher }) => {
    return {
        async start() {
            const useUserVolumeItem = await Patcher.waitForContextMenu(() =>  byName$1("useUserVolumeItem")?.exports);
            Patcher.after(useUserVolumeItem, "default", ({ args: [userId, mediaContext], result }) => {
                if (result) {
                    const volume = SettingsStore.getLocalVolume(userId, mediaContext);
                    return (React.createElement(React.Fragment, null,
                        result,
                        React.createElement(MenuItem, { id: "user-volume-input", render: () => (React.createElement(NumberInput, { min: 0, max: 999999, value: AudioConvert.amplitudeToPerceptual(volume), onChange: (value) => SettingsActions.setLocalVolume(userId, AudioConvert.perceptualToAmplitude(value), mediaContext) })) })));
                }
            });
        },
        stop() { }
    };
});

module.exports = index;

/*@end @*/
