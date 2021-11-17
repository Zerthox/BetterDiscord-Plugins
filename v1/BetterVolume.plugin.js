/**
 * @name BetterVolume
 * @author Zerthox
 * @version 2.0.0
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

let webpackRequire;
global.webpackJsonp.push([
    [],
    {
        __discordium__: (_module, _exports, require) => {
            webpackRequire = require;
        }
    },
    [["__discordium__"]]
]);
delete webpackRequire.m.__discordium__;
delete webpackRequire.c.__discordium__;
const joinFilters = (filters) => {
    return (module) => {
        const { exports } = module;
        return filters.every((filter) => filter(exports, module) || (exports?.__esModule && filter(exports?.default, module)));
    };
};
const filters = {
    byExports(exported) {
        return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
    },
    byName(name) {
        return (target) => target instanceof Object && Object.values(target).some(filters.byDisplayName(name));
    },
    byDisplayName(name) {
        return (target) => target?.displayName === name || target?.constructor?.displayName === name;
    },
    byProps(props) {
        return (target) => target instanceof Object && props.every((prop) => prop in target);
    },
    byProtos(protos) {
        return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
    },
    bySource(contents) {
        return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
    }
};
const genFilters = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? filters.byName(name) : null,
    props instanceof Array ? filters.byProps(props) : null,
    protos instanceof Array ? filters.byProtos(protos) : null,
    source instanceof Array ? filters.bySource(source) : null
].filter((entry) => entry instanceof Function);
const raw = {
    require: webpackRequire,
    getAll: () => Object.values(webpackRequire.c),
    find: (...filters) => raw.getAll().find(joinFilters(filters)) ?? null,
    query: (options) => raw.find(...genFilters(options)),
    byId: (id) => webpackRequire.c[id] ?? null,
    byExports: (exported) => raw.find(filters.byExports(exported)),
    byName: (name) => raw.find(filters.byName(name)),
    byProps: (...props) => raw.find(filters.byProps(props)),
    byProtos: (...protos) => raw.find(filters.byProtos(protos)),
    bySource: (...contents) => raw.find(filters.bySource(contents)),
    all: {
        find: (...filters) => raw.getAll().filter(joinFilters(filters)),
        query: (options) => raw.all.find(...genFilters(options)),
        byExports: (exported) => raw.all.find(filters.byExports(exported)),
        byName: (name) => raw.all.find(filters.byName(name)),
        byProps: (...props) => raw.all.find(filters.byProps(props)),
        byProtos: (...protos) => raw.all.find(filters.byProtos(protos)),
        bySource: (...contents) => raw.all.find(filters.bySource(contents))
    },
    resolveExports(module, filter = null) {
        if (module instanceof Object && "exports" in module) {
            const exported = module.exports;
            if (!exported) {
                return exported;
            }
            if (typeof filter === "string") {
                return exported[filter];
            }
            else if (filter instanceof Function) {
                const result = Object.values(exported).find((value) => filter(value));
                if (result !== undefined) {
                    return result;
                }
            }
            if (exported.__esModule && "default" in exported && Object.keys(exported).length === 1) {
                return exported.default;
            }
            else {
                return exported;
            }
        }
        return null;
    },
    resolveImports(module) {
        const source = webpackRequire.m[module.id].toString();
        const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
        if (match) {
            const requireName = match[1];
            const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\((\\d+)\\)`, "g")));
            return calls.map((call) => raw.byId(call[1]));
        }
        else {
            return [];
        }
    },
    resolveStyles: (module) => raw.resolveImports(module).filter((imported) => (imported instanceof Object
        && "exports" in imported
        && Object.values(imported.exports).every((value) => typeof value === "string")
        && Object.entries(imported.exports).find(([key, value]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))))
};
const Finder = {
    raw,
    getAll: () => raw.getAll().map((entry) => raw.resolveExports(entry)),
    find: (...filters) => raw.resolveExports(raw.find(...filters)),
    query: (options) => raw.resolveExports(raw.query(options), options.export),
    byId: (id) => raw.resolveExports(raw.byId(id)),
    byExports: (exported) => raw.resolveExports(raw.byExports(exported)),
    byName: (name) => raw.resolveExports(raw.byName(name), filters.byDisplayName(name)),
    byProps: (...props) => raw.resolveExports(raw.byProps(...props), filters.byProps(props)),
    byProtos: (...protos) => raw.resolveExports(raw.byProtos(...protos), filters.byProtos(protos)),
    bySource: (...contents) => raw.resolveExports(raw.bySource(...contents), filters.bySource(contents)),
    resolveImports: (exported) => raw.resolveImports(raw.byExports(exported)).map((entry) => raw.resolveExports(entry)),
    resolveStyles: (exported) => raw.resolveStyles(raw.byExports(exported)).map((entry) => raw.resolveExports(entry)),
    all: {
        find: (...filters) => raw.all.find(...filters).map((entry) => raw.resolveExports(entry)),
        query: (options) => raw.all.query(options).map((entry) => raw.resolveExports(entry, options.export)),
        byExports: (exported) => raw.all.byExports(exported).map((entry) => raw.resolveExports(entry)),
        byName: (name) => raw.all.byName(name).map((entry) => raw.resolveExports(entry, filters.byDisplayName(name))),
        byProps: (...props) => raw.all.byProps(...props).map((entry) => raw.resolveExports(entry, filters.byProps(props))),
        byProtos: (...protos) => raw.all.byProtos(...protos).map((entry) => raw.resolveExports(entry, filters.byProtos(protos))),
        bySource: (...contents) => raw.all.bySource(...contents).map((entry) => raw.resolveExports(entry, filters.bySource(contents)))
    }
};

Finder.byProps("subscribe", "emit");
const React = Finder.byProps("createElement", "Component", "Fragment");
const ReactDOM = Finder.byProps("render", "findDOMNode", "createPortal");
const classNames = Finder.find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
Finder.byProps("cloneDeep", "flattenDeep");
Finder.byProps("valid", "satifies");
Finder.byProps("utc", "months");
Finder.byProps("parseBlock", "parseInline");
Finder.byProps("highlight", "highlightBlock");
Finder.byProps("captureBreadcrumb");
Finder.byProps("assert", "validate", "object");
const Flux = Finder.query({ props: ["Store", "connectStores"], export: "default" });
const Dispatcher = Finder.query({ props: ["Dispatcher"], export: "Dispatcher" });
Finder.byProps("languages", "getLocale");

React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events;

const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);
const queryTree = (node, predicate) => {
    if (predicate(node)) {
        return node;
    }
    if (node?.props?.children) {
        for (const child of [node.props.children].flat()) {
            const result = queryTree(child, predicate);
            if (result) {
                return result;
            }
        }
    }
    return null;
};
const queryFiber = (fiber, predicate, direction = "up", depth = 30, current = 0) => {
    if (current > depth) {
        return null;
    }
    if (predicate(fiber)) {
        return fiber;
    }
    if ((direction === "up" || direction === "both") && fiber.return) {
        const result = queryFiber(fiber.return, predicate, "up", depth, current + 1);
        if (result) {
            return result;
        }
    }
    if ((direction === "down" || direction === "both") && fiber.child) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, "down", depth, current + 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }
    return null;
};
const findOwner = (fiber) => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up", 50);
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

const createPatcher = (id, Logger) => {
    const forward = (patcher, object, method, callback, options) => {
        const original = object[method];
        const cancel = patcher(id, object, method, (context, args, result) => {
            const temp = callback({ cancel, original, context, args, result });
            if (options.once) {
                cancel();
            }
            return temp;
        }, { silent: true });
        if (!options.silent) {
            const target = method === "default" ? object[method] : {};
            const name = options.name ?? object.displayName ?? object.constructor?.displayName ?? target.displayName ?? "unknown";
            Logger.log(`Patched ${method} of ${name}`);
        }
        return cancel;
    };
    const { Patcher } = BdApi;
    const instead = (object, method, callback, options = {}) => forward(Patcher.instead, object, method, ({ result: _, ...data }) => callback(data), options);
    const before = (object, method, callback, options = {}) => forward(Patcher.before, object, method, ({ result: _, ...data }) => callback(data), options);
    const after = (object, method, callback, options = {}) => forward(Patcher.after, object, method, callback, options);
    return {
        instead,
        before,
        after,
        unpatchAll: () => {
            Patcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        forceRerender: (fiber) => new Promise((resolve) => {
            const owner = findOwner(fiber);
            if (owner) {
                const { stateNode } = owner;
                after(stateNode, "render", () => null, { once: true });
                stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
            }
            else {
                resolve(false);
            }
        })
    };
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
        super(new Dispatcher(), {
            update: ({ current }) => Data.save("settings", current)
        });
        this.listeners = new Set();
        this.defaults = defaults;
        this.current = Data.load("settings") ?? { ...defaults };
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
        return Flux.connectStores([this], () => ({ ...this.get(), defaults: this.defaults, set: (settings) => this.set(settings) }))(component);
    }
    addListener(listener) {
        this.listeners.add(listener);
        this._dispatcher.subscribe("update", listener);
        return listener;
    }
    removeListener(listener) {
        if (this.listeners.has(listener)) {
            this._dispatcher.unsubscribe("update", listener);
            this.listeners.delete(listener);
        }
    }
    removeAllListeners() {
        for (const listener of this.listeners) {
            this._dispatcher.unsubscribe("update", listener);
        }
        this.listeners.clear();
    }
}
const createSettings = (Data, defaults) => new Settings(Data, defaults);

const Flex = Finder.byName("Flex");
const Button = Finder.byProps("Link", "Hovers");
const Form = Finder.byProps("FormItem", "FormSection", "FormDivider");
const margins = Finder.byProps("marginLarge");

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
        const promise = plugin.stop();
        if (promise) {
            promise.then(() => Logger.log("Disabled"));
        }
        else {
            Logger.log("Disabled");
        }
    };
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(Form.FormSection, null,
            React.createElement(ConnectedSettings, null),
            React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
            React.createElement(Flex, { justify: Flex.Justify.END },
                React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                        onConfirm: () => Settings.reset()
                    }) }, "Reset"))));
    }
    return Wrapper;
};

const name = "BetterVolume";
const author = "Zerthox";
const version = "2.0.0";
const description = "Set user volume values manually instead of using a limited slider.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const styles = ".container-BetterVolume {\n  margin: 0px 8px;\n  padding: 3px 6px;\n  background: var(--background-primary);\n  border-radius: 3px;\n  display: flex;\n}\n\n.input-BetterVolume {\n  margin-right: 2px;\n  flex-grow: 1;\n  background: transparent;\n  border: none;\n  color: var(--interactive-normal);\n  font-weight: 500;\n}";

const SettingsStore = Finder.byProps("getLocalVolume");
const ControlItem = Finder.raw.byName("MenuControlItem")?.exports;
const VolumeInput = ({ value, min = 0, max = 999999, onChange }) => (React.createElement("div", { className: "container-BetterVolume" },
    React.createElement("input", { type: "number", min: min, max: max, value: Math.round((value + Number.EPSILON) * 100) / 100, onChange: ({ target }) => onChange(Math.min(Math.max(parseFloat(target.value), min), max)), className: "input-BetterVolume" }),
    React.createElement("span", null, "%")));
const ConnectedVolumeInput = Flux.connectStores([SettingsStore], ({ control: { value, onChange } }) => ({ value, onChange }))(VolumeInput);
const index = createPlugin({ ...config, styles }, ({ Logger, Patcher }) => ({
    start() {
        Patcher.after(ControlItem, "default", ({ args: [props], result }) => {
            if (props.id === "user-volume") {
                const slider = queryTree(result, (node) => node?.props?.maxValue === 200);
                if (!slider) {
                    Logger.error("Unable to find slider");
                    return;
                }
                const { props } = result;
                props.children = [props.children].flat();
                props.children.push(React.createElement(ConnectedVolumeInput, { control: slider.props }));
                return result;
            }
        });
    },
    stop() { }
}));

module.exports = index;

/*@end @*/
