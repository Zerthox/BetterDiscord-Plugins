/**
 * @name DiumDevTools
 * @author Zerthox
 * @version 0.2.2
 * @description Makes Dium available as global for development.
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

const join = (filters) => {
    const apply = filters.filter((filter) => filter instanceof Function);
    return (exports) => apply.every((filter) => filter(exports));
};
const generate = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? byName$2(name) : null,
    props instanceof Array ? byProps$2(props) : null,
    protos instanceof Array ? byProtos$2(protos) : null,
    source instanceof Array ? bySource$2(source) : null
];
const byExports$2 = (exported) => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
};
const byName$2 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byOwnName(name));
};
const byOwnName = (name) => {
    return (target) => (target?.getName?.() ?? target?.displayName ?? target?.constructor?.displayName) === name;
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

const Filters = {
    __proto__: null,
    join: join,
    generate: generate,
    byExports: byExports$2,
    byName: byName$2,
    byOwnName: byOwnName,
    byProps: byProps$2,
    byProtos: byProtos$2,
    bySource: bySource$2
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
const find$1 = (...filters) => raw.single(join(filters));
const query$1 = (options) => resolveExports(find$1(...generate(options)), options.export);
const byExports$1 = (exported) => find$1(byExports$2(exported));
const byName$1 = (name) => resolveExports(find$1(byName$2(name)), byOwnName(name));
const byProps$1 = (...props) => find$1(byProps$2(props));
const byProtos$1 = (...protos) => find$1(byProtos$2(protos));
const bySource$1 = (...contents) => find$1(bySource$2(contents));
const all$1 = {
    find: (...filters) => raw.all(join(filters)),
    query: (options) => all$1.find(...generate(options)).map((entry) => resolveExports(entry, options.export)),
    byExports: (exported) => all$1.find(byExports$2(exported)),
    byName: (name) => all$1.find(byName$2(name)).map((entry) => resolveExports(entry, byOwnName(name))),
    byProps: (...props) => all$1.find(byProps$2(props)),
    byProtos: (...protos) => all$1.find(byProtos$2(protos)),
    bySource: (...contents) => all$1.find(bySource$2(contents))
};

const index$2 = {
    __proto__: null,
    find: find$1,
    query: query$1,
    byExports: byExports$1,
    byName: byName$1,
    byProps: byProps$1,
    byProtos: byProtos$1,
    bySource: bySource$1,
    all: all$1,
    Filters: Filters
};

const EventEmitter = () => byProps$1("subscribe", "emit");
const React$1 = () => byProps$1("createElement", "Component", "Fragment");
const ReactDOM$1 = () => byProps$1("render", "findDOMNode", "createPortal");
const classNames$1 = () => find$1((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const lodash$1 = () => byProps$1("cloneDeep", "flattenDeep");
const semver = () => byProps$1("valid", "satifies");
const moment = () => byProps$1("utc", "months");
const SimpleMarkdown = () => byProps$1("parseBlock", "parseInline");
const hljs = () => byProps$1("highlight", "highlightBlock");
const Raven = () => byProps$1("captureBreadcrumb");
const joi = () => byProps$1("assert", "validate", "object");

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

const Flux$1 = () => byProps$1("Store", "useStateFromStores");
const Events = () => byProps$1("dirtyDispatch");

const flux = {
    __proto__: null,
    Flux: Flux$1,
    Events: Events
};

const Constants = () => byProps$1("Permissions", "RelationshipTypes");
const i18n = () => byProps$1("languages", "getLocale");
const Channels = () => byProps$1("getChannel", "hasChannel");
const SelectedChannel = () => byProps$1("getChannelId", "getVoiceChannelId");
const Users = () => byProps$1("getUser", "getCurrentUser");
const Members = () => byProps$1("getMember", "isMember");
const ContextMenuActions = () => byProps$1("openContextMenuLazy");
const ModalActions = () => byProps$1("openModalLazy");
const Flex$1 = () => byName$1("Flex");
const Button$1 = () => byProps$1("Link", "Hovers");
const Text = () => byName$1("Text");
const Links = () => byProps$1("Link", "NavLink");
const Switch = () => byName$1("Switch");
const SwitchItem = () => byName$1("SwitchItem");
const RadioGroup = () => byName$1("RadioGroup");
const Slider = () => byName$1("Slider");
const TextInput = () => byName$1("TextInput");
const Menu = () => byProps$1("MenuGroup", "MenuItem", "MenuSeparator");
const Form$1 = () => byProps$1("FormItem", "FormSection", "FormDivider");
const margins$1 = () => byProps$1("marginLarge");

const discord$1 = {
    __proto__: null,
    Constants: Constants,
    i18n: i18n,
    Channels: Channels,
    SelectedChannel: SelectedChannel,
    Users: Users,
    Members: Members,
    ContextMenuActions: ContextMenuActions,
    ModalActions: ModalActions,
    Flex: Flex$1,
    Button: Button$1,
    Text: Text,
    Links: Links,
    Switch: Switch,
    SwitchItem: SwitchItem,
    RadioGroup: RadioGroup,
    Slider: Slider,
    TextInput: TextInput,
    Menu: Menu,
    Form: Form$1,
    margins: margins$1
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
    ...discord$1
});
const Modules$1 = Modules;
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
        waitForLazy: (object, method, argIndex, callback) => new Promise((resolve) => {
            const found = callback();
            if (found) {
                resolve(found);
            }
            else {
                Logger.log(`Waiting for lazy load in ${method} of ${resolveName(object, method)}`);
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
        waitForContextMenu: (callback) => patcher.waitForLazy(Modules$1.ContextMenuActions, "openContextMenuLazy", 1, callback),
        waitForModal: (callback) => patcher.waitForLazy(Modules$1.ModalActions, "openModalLazy", 0, callback)
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
    get() {
        return { ...this.current };
    }
    set(settings) {
        Object.assign(this.current, settings instanceof Function ? settings(this.get()) : settings);
        this.dispatch();
    }
    reset() {
        this.set({ ...this.defaults });
    }
    delete(...keys) {
        for (const key of keys) {
            delete this.current[key];
        }
        this.dispatch();
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

const discord = {
    __proto__: null
};

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

const index$1 = {
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
};

const { Flex, Button, Form, margins } = Modules$1;
const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const version$1 = "0.2.5";

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
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React.createElement(ConnectedSettings, null)));
    }
    return Wrapper;
};

const dium = {
    __proto__: null,
    createPlugin: createPlugin,
    Finder: index$2,
    Discord: discord,
    ReactInternals: ReactInternals,
    ReactDOMInternals: ReactDOMInternals,
    Utils: index$1,
    Modules: Modules$1,
    version: version$1,
    React: React,
    ReactDOM: ReactDOM,
    classNames: classNames,
    lodash: lodash,
    Flux: Flux
};

const getWebpackRequire = () => {
    const chunkName = Object.keys(window).find((key) => key.startsWith("webpackChunk"));
    const chunk = window[chunkName];
    let webpackRequire;
    try {
        chunk.push([["__DIUM__"], {}, (require) => {
                webpackRequire = require;
                throw Error();
            }]);
    }
    catch {
    }
    return webpackRequire;
};
const webpackRequire = getWebpackRequire();
const applyFilters = (filters) => (module) => {
    const { exports } = module;
    return (filters.every((filter) => filter(exports, module))
        || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module)));
};
const modules = () => Object.values(webpackRequire.c);
const sources = () => Object.values(webpackRequire.m);
const sourceOf = (id) => webpackRequire.m[id] ?? null;
const find = (...filters) => modules().find(applyFilters(filters)) ?? null;
const query = (options) => find(...generate(options));
const byId = (id) => webpackRequire.c[id] ?? null;
const byExports = (exported) => find(byExports$2(exported));
const byName = (name) => find(byName$2(name));
const byProps = (...props) => find(byProps$2(props));
const byProtos = (...protos) => find(byProtos$2(protos));
const bySource = (...contents) => find(bySource$2(contents));
const all = {
    find: (...filters) => modules().filter(applyFilters(filters)),
    query: (options) => all.find(...generate(options)),
    byExports: (exported) => all.find(byExports$2(exported)),
    byName: (name) => all.find(byName$2(name)),
    byProps: (...props) => all.find(byProps$2(props)),
    byProtos: (...protos) => all.find(byProtos$2(protos)),
    bySource: (...contents) => all.find(bySource$2(contents))
};
const resolveImportIds = (module) => {
    const source = sourceOf(module.id).toString();
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
const resolveImports = (module) => resolveImportIds(module).map((id) => byId(id));
const resolveStyles = (module) => resolveImports(module).filter((imported) => (imported instanceof Object
    && "exports" in imported
    && Object.values(imported.exports).every((value) => typeof value === "string")
    && Object.entries(imported.exports).find(([key, value]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value))));
const resolveUsersById = (id) => all.find((_, user) => resolveImportIds(user).includes(id));
const resolveUsers = (module) => resolveUsersById(module.id);

const DevFinder = {
    __proto__: null,
    require: webpackRequire,
    modules: modules,
    sources: sources,
    sourceOf: sourceOf,
    find: find,
    query: query,
    byId: byId,
    byExports: byExports,
    byName: byName,
    byProps: byProps,
    byProtos: byProtos,
    bySource: bySource,
    all: all,
    resolveImportIds: resolveImportIds,
    resolveImports: resolveImports,
    resolveStyles: resolveStyles,
    resolveUsersById: resolveUsersById,
    resolveUsers: resolveUsers
};

const name = "DiumDevTools";
const author = "Zerthox";
const version = "0.2.2";
const description = "Makes Dium available as global for development.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const { Finder } = dium;
Finder.dev = DevFinder;
const index = createPlugin(config, () => ({
    start() {
        window.dium = dium;
    },
    stop() {
        delete window.dium;
    }
}));

module.exports = index;

/*@end @*/
