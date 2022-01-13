/**
 * @name DiscordiumDevTools
 * @author Zerthox
 * @version 0.1.0
 * @description Makes Discordium available as global for development.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/DevTools
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/dist/bd/DevTools.plugin.js
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

const byExports$2 = (exported) => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
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
const byProtos$2 = (protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource$2 = (contents) => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};

const filters = /*#__PURE__*/Object.freeze({
    __proto__: null,
    byExports: byExports$2,
    byName: byName$2,
    byDisplayName: byDisplayName,
    byProps: byProps$2,
    byProtos: byProtos$2,
    bySource: bySource$2
});

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
    protos instanceof Array ? byProtos$2(protos) : null,
    source instanceof Array ? bySource$2(source) : null
].filter((entry) => entry instanceof Function);
const webpackRequire = getWebpackRequire();
const getAll$1 = () => Object.values(webpackRequire.c);
const getSources = () => Object.values(webpackRequire.m);
const getSource = (id) => webpackRequire.m[id] ?? null;
const find$1 = (...filters) => /*@__PURE__*/ getAll$1().find(joinFilters(filters)) ?? null;
const query$1 = (options) => /*@__PURE__*/ find$1(...genFilters(options));
const byId$1 = (id) => webpackRequire.c[id] ?? null;
const byExports$1 = (exported) => /*@__PURE__*/ find$1(byExports$2(exported));
const byName$1 = (name) => /*@__PURE__*/ find$1(byName$2(name));
const byProps$1 = (...props) => /*@__PURE__*/ find$1(byProps$2(props));
const byProtos$1 = (...protos) => /*@__PURE__*/ find$1(byProtos$2(protos));
const bySource$1 = (...contents) => /*@__PURE__*/ find$1(bySource$2(contents));
const all$1 = {
    find: (...filters) => /*@__PURE__*/ getAll$1().filter(joinFilters(filters)),
    query: (options) => all$1.find(...genFilters(options)),
    byExports: (exported) => all$1.find(byExports$2(exported)),
    byName: (name) => all$1.find(byName$2(name)),
    byProps: (...props) => all$1.find(byProps$2(props)),
    byProtos: (...protos) => all$1.find(byProtos$2(protos)),
    bySource: (...contents) => all$1.find(bySource$2(contents))
};
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
const resolveImportIds$1 = (module) => {
    const source = /*@__PURE__*/ getSource(module.id).toString();
    const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
    if (match) {
        const requireName = match[1];
        const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\((\\d+)\\)`, "g")));
        return calls.map((call) => parseInt(call[1]));
    }
    else {
        return [];
    }
};
const resolveImports$1 = (module) => resolveImportIds$1(module).map((id) => /*@__PURE__*/ byId$1(id));
const resolveStyles$1 = (module) => resolveImports$1(module).filter((imported) => (imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))));
const resolveUsers$1 = (module) => all$1.find((_, user) => resolveImportIds$1(user).includes(module.id));

const raw = /*#__PURE__*/Object.freeze({
    __proto__: null,
    webpackRequire: webpackRequire,
    getAll: getAll$1,
    getSources: getSources,
    getSource: getSource,
    find: find$1,
    query: query$1,
    byId: byId$1,
    byExports: byExports$1,
    byName: byName$1,
    byProps: byProps$1,
    byProtos: byProtos$1,
    bySource: bySource$1,
    all: all$1,
    resolveExports: resolveExports,
    resolveImportIds: resolveImportIds$1,
    resolveImports: resolveImports$1,
    resolveStyles: resolveStyles$1,
    resolveUsers: resolveUsers$1
});

const getAll = () => /*@__PURE__*/ getAll$1().map((entry) => resolveExports(entry));
const find = (...filters) => resolveExports(/*@__PURE__*/ find$1(...filters));
const query = (options) => resolveExports(/*@__PURE__*/ query$1(options), { export: options.export });
const byId = (id) => resolveExports(/*@__PURE__*/ byId$1(id));
const byExports = (exported) => resolveExports(/*@__PURE__*/ byExports$1(exported));
const byName = (name) => resolveExports(/*@__PURE__*/ byName$1(name), { name });
const byProps = (...props) => resolveExports(/*@__PURE__*/ byProps$1(...props), { filter: byProps$2(props) });
const byProtos = (...protos) => resolveExports(/*@__PURE__*/ byProtos$1(...protos), { filter: byProtos$2(protos) });
const bySource = (...contents) => resolveExports(/*@__PURE__*/ bySource$1(...contents), { filter: bySource$2(contents) });
const resolveImportIds = (exported) => resolveImportIds$1(/*@__PURE__*/ byExports$1(exported));
const resolveImports = (exported) => resolveImports$1(/*@__PURE__*/ byExports$1(exported)).map((entry) => resolveExports(entry));
const resolveStyles = (exported) => resolveStyles$1(/*@__PURE__*/ byExports$1(exported)).map((entry) => resolveExports(entry));
const resolveUsers = (exported) => resolveUsers$1(/*@__PURE__*/ byExports$1(exported)).map((entry) => resolveExports(entry));
const all = {
    find: (...filters) => all$1.find(...filters).map((entry) => resolveExports(entry)),
    query: (options) => all$1.query(options).map((entry) => resolveExports(entry, { export: options.export })),
    byExports: (exported) => all$1.byExports(exported).map((entry) => resolveExports(entry)),
    byName: (name) => all$1.byName(name).map((entry) => resolveExports(entry, { name })),
    byProps: (...props) => all$1.byProps(...props).map((entry) => resolveExports(entry, { filter: byProps$2(props) })),
    byProtos: (...protos) => all$1.byProtos(...protos).map((entry) => resolveExports(entry, { filter: byProtos$2(protos) })),
    bySource: (...contents) => all$1.bySource(...contents).map((entry) => resolveExports(entry, { filter: bySource$2(contents) }))
};

const index$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getAll: getAll,
    find: find,
    query: query,
    byId: byId,
    byExports: byExports,
    byName: byName,
    byProps: byProps,
    byProtos: byProtos,
    bySource: bySource,
    resolveImportIds: resolveImportIds,
    resolveImports: resolveImports,
    resolveStyles: resolveStyles,
    resolveUsers: resolveUsers,
    all: all,
    raw: raw,
    filters: filters
});

const EventEmitter = /*@__PURE__*/ byProps("subscribe", "emit");
const React = /*@__PURE__*/ byProps("createElement", "Component", "Fragment");
const ReactDOM = /*@__PURE__*/ byProps("render", "findDOMNode", "createPortal");
const classNames = /*@__PURE__*/ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const lodash = /*@__PURE__*/ byProps("cloneDeep", "flattenDeep");
const semver = /*@__PURE__*/ byProps("valid", "satifies");
const moment = /*@__PURE__*/ byProps("utc", "months");
const SimpleMarkdown = /*@__PURE__*/ byProps("parseBlock", "parseInline");
const hljs = /*@__PURE__*/ byProps("highlight", "highlightBlock");
const Raven = /*@__PURE__*/ byProps("captureBreadcrumb");
const joi = /*@__PURE__*/ byProps("assert", "validate", "object");

const Dispatch = /*@__PURE__*/ query({ props: ["default", "Dispatcher"], filter: (exports) => exports instanceof Object && !("ActionBase" in exports) });
const Events = Dispatch?.default;

const Flux = /*@__PURE__*/ byProps("Store", "useStateFromStores");

const Constants = /*@__PURE__*/ byProps("Permissions", "RelationshipTypes");
const i18n = /*@__PURE__*/ byProps("languages", "getLocale");
const Channels = /*@__PURE__*/ byProps("getChannel", "hasChannel");
const SelectedChannel = /*@__PURE__*/ query({ props: ["getChannelId", "getVoiceChannelId"], export: "default" });
const Users = /*@__PURE__*/ byProps("getUser", "getCurrentUser");
const Members = /*@__PURE__*/ byProps("getMember", "isMember");
const ContextMenuActions = /*@__PURE__*/ byProps("openContextMenuLazy");
const ModalActions = /*@__PURE__*/ byProps("openModalLazy");
const Flex = /*@__PURE__*/ byName("Flex");
const Button = /*@__PURE__*/ byProps("Link", "Hovers");
const Menu = /*@__PURE__*/ byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form = /*@__PURE__*/ byProps("FormItem", "FormSection", "FormDivider");
const margins = /*@__PURE__*/ byProps("marginLarge");

const index$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Constants: Constants,
    i18n: i18n,
    Channels: Channels,
    SelectedChannel: SelectedChannel,
    Users: Users,
    Members: Members,
    ContextMenuActions: ContextMenuActions,
    ModalActions: ModalActions,
    Flex: Flex,
    Button: Button,
    Menu: Menu,
    Form: Form,
    margins: margins,
    Dispatch: Dispatch,
    Events: Events,
    Flux: Flux,
    EventEmitter: EventEmitter,
    React: React,
    ReactDOM: ReactDOM,
    classNames: classNames,
    lodash: lodash,
    semver: semver,
    moment: moment,
    SimpleMarkdown: SimpleMarkdown,
    hljs: hljs,
    Raven: Raven,
    joi: joi
});

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

const discord = /*#__PURE__*/Object.freeze({
    __proto__: null
});

const ReactInternals = React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
const ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
};

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const alert = (title, content) => BdApi.alert(title, content);
const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);
const toast = (content, options) => BdApi.showToast(content, options);

const queryTree = (node, predicate) => {
    const worklist = [node];
    while (worklist.length !== 0) {
        const node = worklist.shift();
        if (predicate(node)) {
            return node;
        }
        if (node?.props?.children) {
            worklist.push(...[node.props.children].flat());
        }
    }
    return null;
};
const queryTreeAll = (node, predicate) => {
    const result = [];
    const worklist = [node];
    while (worklist.length !== 0) {
        const node = worklist.shift();
        if (predicate(node)) {
            result.push(node);
        }
        if (node?.props?.children) {
            worklist.push(...[node.props.children].flat());
        }
    }
    return result;
};
const getFiber = (node) => ReactDOMInternals.getInstanceFromNode(node ?? {});
const queryFiber = (fiber, predicate, direction = "up" , depth = 30, current = 0) => {
    if (current > depth) {
        return null;
    }
    if (predicate(fiber)) {
        return fiber;
    }
    if ((direction === "up"  || direction === "both" ) && fiber.return) {
        const result = queryFiber(fiber.return, predicate, "up" , depth, current + 1);
        if (result) {
            return result;
        }
    }
    if ((direction === "down"  || direction === "both" ) && fiber.child) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, "down" , depth, current + 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }
    return null;
};
const findOwner = (fiber) => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up" , 50);
};
const forceUpdateOwner = (fiber) => new Promise((resolve) => {
    const owner = findOwner(fiber);
    if (owner) {
        owner.stateNode.forceUpdate(() => resolve(true));
    }
    else {
        resolve(false);
    }
});
const forceFullRerender = (fiber) => new Promise((resolve) => {
    const owner = findOwner(fiber);
    if (owner) {
        const { stateNode } = owner;
        const original = stateNode.render;
        stateNode.render = function forceRerender() {
            original.call(this);
            stateNode.render = original;
            return null;
        };
        stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
    }
    else {
        resolve(false);
    }
});

const index$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    sleep: sleep,
    alert: alert,
    confirm: confirm,
    toast: toast,
    queryTree: queryTree,
    queryTreeAll: queryTreeAll,
    getFiber: getFiber,
    queryFiber: queryFiber,
    findOwner: findOwner,
    forceUpdateOwner: forceUpdateOwner,
    forceFullRerender: forceFullRerender
});

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const version$1 = "0.2.2";

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

const Discordium = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createPlugin: createPlugin,
    Finder: index$3,
    Discord: discord,
    ReactInternals: ReactInternals,
    ReactDOMInternals: ReactDOMInternals,
    Utils: index$1,
    Modules: index$2,
    React: React,
    ReactDOM: ReactDOM,
    classNames: classNames,
    lodash: lodash,
    Flux: Flux,
    version: version$1,
    Settings: Settings
});

const name = "DiscordiumDevTools";
const author = "Zerthox";
const version = "0.1.0";
const description = "Makes Discordium available as global for development.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

global.Discordium = Discordium;
const index = createPlugin(config, () => ({
    start() { },
    stop() { }
}));

module.exports = index;

/*@end @*/
