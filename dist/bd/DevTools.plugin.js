/**
 * @name DevTools
 * @author Zerthox
 * @version 0.3.3
 * @description Utilities for development.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/DevTools
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

const join = (filters) => {
    return (target) => filters.every((filter) => filter(target));
};
const query$2 = ({ filter, name, anyName, props, protos, source }) => join([
    ...[filter].flat(),
    typeof name === "string" ? byName$2(name) : null,
    typeof anyName === "string" ? byAnyName$2(anyName) : null,
    props instanceof Array ? byProps$2(props) : null,
    protos instanceof Array ? byProtos$2(protos) : null,
    source instanceof Array ? bySource$2(source) : null
].filter(Boolean));
const byName$2 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byAnyName$2 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byName$2(name));
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

const filters = {
    __proto__: null,
    join: join,
    query: query$2,
    byName: byName$2,
    byAnyName: byAnyName$2,
    byProps: byProps$2,
    byProtos: byProtos$2,
    bySource: bySource$2
};

const resolveExport = (target, filter) => {
    if (target && typeof filter === "function") {
        return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
    }
    return target;
};
const find$1 = (filter, resolve = true) => BdApi.Webpack.getModule(filter, { defaultExport: resolve });
const query$1 = (options) => find$1(query$2(options), options.resolve);
const byName$1 = (name, resolve = true) => find$1(byName$2(name), resolve);
const byAnyName$1 = (name, resolve = true) => resolveExport(find$1(byAnyName$2(name)), resolve ? byName$2(name) : null);
const byProps$1 = (...props) => find$1(byProps$2(props));
const byProtos$1 = (...protos) => find$1(byProtos$2(protos));
const bySource$1 = (...contents) => find$1(bySource$2(contents));
const all$1 = {
    find: (filter, resolve = true) => BdApi.Webpack.getModule(filter, { first: false, defaultExport: resolve }) ?? [],
    query: (options) => all$1.find(query$2(options), options.resolve),
    byName: (name, resolve = true) => all$1.find(byName$2(name), resolve),
    byAnyName: (name, resolve = true) => all$1.find(byAnyName$2(name)).map((entry) => resolveExport(entry, resolve ? byName$2(name) : null)),
    byProps: (...props) => all$1.find(byProps$2(props)),
    byProtos: (...protos) => all$1.find(byProtos$2(protos)),
    bySource: (...contents) => all$1.find(bySource$2(contents))
};

const finder = {
    __proto__: null,
    find: find$1,
    query: query$1,
    byName: byName$1,
    byAnyName: byAnyName$1,
    byProps: byProps$1,
    byProtos: byProtos$1,
    bySource: bySource$1,
    all: all$1
};

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

const EventEmitter = /* @__PURE__ */ byProps$1("subscribe", "emit");
const React$1 = /* @__PURE__ */ byProps$1("createElement", "Component", "Fragment");
const ReactDOM = /* @__PURE__ */ byProps$1("render", "findDOMNode", "createPortal");
const ReactSpring = /* @__PURE__ */ byProps$1("SpringContext", "animated");
const classNames = /* @__PURE__ */ find$1((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const lodash = /* @__PURE__ */ byProps$1("cloneDeep", "flattenDeep");
const semver = /* @__PURE__ */ byProps$1("SemVer");
const moment = /* @__PURE__ */ byProps$1("utc", "months");
const SimpleMarkdown = /* @__PURE__ */ byProps$1("parseBlock", "parseInline");
const hljs = /* @__PURE__ */ byProps$1("highlight", "highlightBlock");
const platform = /* @__PURE__ */ byProps$1("os", "manufacturer");
const lottie = /* @__PURE__ */ byProps$1("setSubframeRendering");

const Constants = /* @__PURE__ */ byProps$1("Permissions", "RelationshipTypes");
const i18n = /* @__PURE__ */ byProps$1("languages", "getLocale");

const Flux = /* @__PURE__ */ byProps$1("Store", "useStateFromStores");
const Dispatcher = /* @__PURE__ */ byProps$1("dispatch", "subscribe");

const Platforms = /* @__PURE__ */ byProps$1("getPlatform", "isWindows", "isWeb", "PlatformTypes");
const ClientActions = /* @__PURE__ */ byProps$1("toggleGuildFolderExpand");
const UserSettings = /* @__PURE__ */ byProps$1("MessageDisplayCompact");
const LocaleStore = /* @__PURE__ */ byName$1("LocaleStore");
const ThemeStore = /* @__PURE__ */ byName$1("ThemeStore");
const ContextMenuActions = /* @__PURE__ */ byProps$1("openContextMenuLazy");
const ModalActions = /* @__PURE__ */ byProps$1("openModalLazy");
const MediaEngineStore = /* @__PURE__ */ byProps$1("getLocalVolume");
const MediaEngineActions = /* @__PURE__ */ byProps$1("setLocalVolume");

const UserStore = /* @__PURE__ */ byProps$1("getUser", "getCurrentUser");
const PresenceStore = /* @__PURE__ */ byProps$1("getState", "getStatus", "isMobileOnline");
const RelationshipStore = /* @__PURE__ */ byProps$1("isFriend", "getRelationshipCount");

const GuildStore = /* @__PURE__ */ byProps$1("getGuild");
const GuildActions = /* @__PURE__ */ byProps$1("requestMembers");
const GuildMemberStore = /* @__PURE__ */ byProps$1("getMember", "isMember");

const ChannelStore = /* @__PURE__ */ byProps$1("getChannel", "hasChannel");
const ChannelActions = /* @__PURE__ */ byProps$1("selectChannel");
const SelectedChannelStore = /* @__PURE__ */ byProps$1("getChannelId", "getVoiceChannelId");

const Flex = /* @__PURE__ */ byAnyName$1("Flex");
const Button = /* @__PURE__ */ byProps$1("Link", "Hovers");
const Text = /* @__PURE__ */ byAnyName$1("Text");
const Clickable = /* @__PURE__ */ byAnyName$1("Clickable");
const Links = /* @__PURE__ */ byProps$1("Link", "NavLink");
const Switch = /* @__PURE__ */ byAnyName$1("Switch");
const SwitchItem = /* @__PURE__ */ byAnyName$1("SwitchItem");
const RadioGroup = /* @__PURE__ */ byAnyName$1("RadioGroup");
const Slider = /* @__PURE__ */ byAnyName$1("Slider");
const TextInput = /* @__PURE__ */ byAnyName$1("TextInput");
const Menu = /* @__PURE__ */ byProps$1("MenuGroup", "MenuItem", "MenuSeparator");
const Form = /* @__PURE__ */ byProps$1("FormItem", "FormSection", "FormDivider");
const margins = /* @__PURE__ */ byProps$1("marginLarge");

const Modules = {
    __proto__: null,
    Flux: Flux,
    Dispatcher: Dispatcher,
    EventEmitter: EventEmitter,
    React: React$1,
    ReactDOM: ReactDOM,
    ReactSpring: ReactSpring,
    classNames: classNames,
    lodash: lodash,
    semver: semver,
    moment: moment,
    SimpleMarkdown: SimpleMarkdown,
    hljs: hljs,
    platform: platform,
    lottie: lottie,
    Constants: Constants,
    i18n: i18n,
    Platforms: Platforms,
    ClientActions: ClientActions,
    UserSettings: UserSettings,
    LocaleStore: LocaleStore,
    ThemeStore: ThemeStore,
    ContextMenuActions: ContextMenuActions,
    ModalActions: ModalActions,
    MediaEngineStore: MediaEngineStore,
    MediaEngineActions: MediaEngineActions,
    UserStore: UserStore,
    PresenceStore: PresenceStore,
    RelationshipStore: RelationshipStore,
    GuildStore: GuildStore,
    GuildActions: GuildActions,
    GuildMemberStore: GuildMemberStore,
    ChannelStore: ChannelStore,
    ChannelActions: ChannelActions,
    SelectedChannelStore: SelectedChannelStore,
    Flex: Flex,
    Button: Button,
    Text: Text,
    Clickable: Clickable,
    Links: Links,
    Switch: Switch,
    SwitchItem: SwitchItem,
    RadioGroup: RadioGroup,
    Slider: Slider,
    TextInput: TextInput,
    Menu: Menu,
    Form: Form,
    margins: margins
};

const ReactInternals = React$1?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
const ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
};

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
        React$1.useEffect(() => {
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
    return queryFiber(fiber, (node) => node?.stateNode instanceof React$1.Component, "up" , 50);
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

const SettingsContainer = ({ name, children, onReset }) => (React$1.createElement(Form.FormSection, null,
    children,
    React$1.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React$1.createElement(Flex, { justify: Flex.Justify.END },
        React$1.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const version = "0.2.12";

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
        getSettingsPanel: plugin.SettingsPanel ? () => (React$1.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React$1.createElement(plugin.SettingsPanel, null))) : null
    };
};

const dium = {
    __proto__: null,
    createPlugin: createPlugin,
    Filters: filters,
    Finder: finder,
    ReactInternals: ReactInternals,
    ReactDOMInternals: ReactDOMInternals,
    Utils: index$1,
    React: React$1,
    ReactDOM: ReactDOM,
    Flux: Flux,
    version: version
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
const byExportsFilter = (exported) => {
    return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
};
const byModuleSourceFilter = (contents) => {
    return (_, module) => {
        const source = sourceOf(module.id).toString();
        return contents.every((content) => source.includes(content));
    };
};
const applyFilters = (filters) => (module) => {
    const { exports } = module;
    return (filters.every((filter) => filter(exports, module, String(module.id)))
        || exports?.__esModule && "default" in exports && filters.every((filter) => filter(exports.default, module, String(module.id))));
};
const modules = () => Object.values(webpackRequire.c);
const sources = () => Object.values(webpackRequire.m);
const sourceOf = (id) => webpackRequire.m[id] ?? null;
const find = (...filters) => modules().find(applyFilters(filters)) ?? null;
const query = (options) => find(query$2(options));
const byId = (id) => webpackRequire.c[id] ?? null;
const byExports = (exported) => find(byExportsFilter(exported));
const byName = (name) => find(byName$2(name));
const byAnyName = (name) => find(byAnyName$2(name));
const byProps = (...props) => find(byProps$2(props));
const byProtos = (...protos) => find(byProtos$2(protos));
const bySource = (...contents) => find(bySource$2(contents));
const byModuleSource = (...contents) => find(byModuleSourceFilter(contents));
const all = {
    find: (...filters) => modules().filter(applyFilters(filters)),
    query: (options) => all.find(query$2(options)),
    byExports: (exported) => all.find(byExportsFilter(exported)),
    byName: (name) => all.find(byName$2(name)),
    byAnyName: (name) => all.find(byAnyName$2(name)),
    byProps: (...props) => all.find(byProps$2(props)),
    byProtos: (...protos) => all.find(byProtos$2(protos)),
    bySource: (...contents) => all.find(bySource$2(contents)),
    byModuleSource: (...contents) => all.find(byModuleSourceFilter(contents))
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
    byAnyName: byAnyName,
    byProps: byProps,
    byProtos: byProtos,
    bySource: bySource,
    byModuleSource: byModuleSource,
    all: all,
    resolveImportIds: resolveImportIds,
    resolveImports: resolveImports,
    resolveStyles: resolveStyles,
    resolveUsersById: resolveUsersById,
    resolveUsers: resolveUsers
};

const { React, Finder } = dium;
const { UserFlags } = Constants;
const settings = {
    global: true,
    developer: false,
    staff: false
};
const diumGlobal = {
    ...dium,
    Finder: { ...Finder, dev: DevFinder },
    Modules
};
const updateGlobal = (expose) => {
    if (expose) {
        window.dium = diumGlobal;
    }
    else {
        delete window.dium;
    }
};
const updateStaffFlag = (flag) => {
    const user = UserStore.getCurrentUser();
    if (flag) {
        user.flags |= UserFlags.STAFF;
    }
    else {
        user.flags &= ~UserFlags.STAFF;
    }
    UserStore.emitChange();
};
const index = createPlugin({ settings }, ({ Settings }) => ({
    start() {
        updateGlobal(Settings.current.global);
        try {
            updateStaffFlag(Settings.current.staff);
        }
        catch (err) {
            console.error(err);
        }
    },
    stop() {
        updateGlobal(false);
        try {
            updateStaffFlag(false);
        }
        catch (err) {
            console.error(err);
        }
    },
    SettingsPanel: () => {
        const [settings, setSettings] = Settings.useState();
        return (React.createElement(React.Fragment, null,
            React.createElement(SwitchItem, { value: settings.global, onChange: (checked) => {
                    setSettings({ global: checked });
                    updateGlobal(checked);
                }, note: "Expose dium as global for development." }, "Dium Global"),
            React.createElement(SwitchItem, { disabled
                : true, value: false, note: "Enable experiments & other developer tabs in settings. Reopen to see them." }, "Enable Developer Experiments"),
            React.createElement(SwitchItem, { value: settings.staff, onChange: (checked) => {
                    setSettings({ staff: checked });
                    updateStaffFlag(checked);
                }, note: "Add the Staff flag to the current user.", hideBorder: true }, "Enable Staff flag")));
    }
}));

module.exports = index;

/*@end @*/
