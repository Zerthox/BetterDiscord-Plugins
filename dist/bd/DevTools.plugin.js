/**
 * @name DevTools
 * @author Zerthox
 * @version 0.4.0
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
    load: (key) => BdApi.Data.load(id, key) ?? null,
    save: (key, value) => BdApi.Data.save(id, key, value),
    delete: (key) => BdApi.Data.delete(id, key)
});

const createLazy = () => {
    let controller = new AbortController();
    return {
        waitFor: (filter, { resolve = true, entries = false }) => BdApi.Webpack.waitForModule(filter, {
            signal: controller.signal,
            defaultExport: resolve,
            searchExports: entries
        }),
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

const createPatcher = (id, Logger) => {
    const forward = (patcher, type, object, method, callback, options) => {
        const original = object?.[method];
        if (!(original instanceof Function)) {
            throw TypeError(`patch target ${original} is not a function`);
        }
        const cancel = patcher[type](id, object, method, options.once ? (...args) => {
            const result = callback(cancel, original, ...args);
            cancel();
            return result;
        } : (...args) => callback(cancel, original, ...args));
        if (!options.silent) {
            Logger.log(`Patched ${options.name ?? String(method)}`);
        }
        return cancel;
    };
    return {
        instead: (object, method, callback, options = {}) => forward(BdApi.Patcher, "instead", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        before: (object, method, callback, options = {}) => forward(BdApi.Patcher, "before", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        after: (object, method, callback, options = {}) => forward(BdApi.Patcher, "after", object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options),
        unpatchAll: () => {
            if (BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};

const join = (...filters) => {
    return (...args) => filters.every((filter) => filter(...args));
};
const query$2 = ({ filter, name, props, protos, source }) => join(...[
    ...[filter].flat(),
    typeof name === "string" ? byName$2(name) : null,
    props instanceof Array ? byProps$2(...props) : null,
    protos instanceof Array ? byProtos$2(...protos) : null,
    source instanceof Array ? bySource$2(...source) : null
].filter(Boolean));
const byEntry = (filter) => {
    return (target, ...args) => target instanceof Object && target !== window && Object.values(target).some((value) => filter(value, ...args));
};
const byName$2 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byProps$2 = (...props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos$2 = (...protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource$2 = (...fragments) => {
    return (target) => {
        if (target instanceof Function) {
            const source = target.toString();
            const renderSource = target.prototype?.render?.toString();
            return fragments.every((fragment) => (typeof fragment === "string" ? (source.includes(fragment) || renderSource?.includes(fragment)) : (fragment(source) || renderSource && fragment(renderSource))));
        }
        else {
            return false;
        }
    };
};

const filters = {
    __proto__: null,
    join,
    query: query$2,
    byEntry,
    byName: byName$2,
    byProps: byProps$2,
    byProtos: byProtos$2,
    bySource: bySource$2
};

const find$1 = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});
const query$1 = (query, options) => find$1(query$2(query), options);
const byName$1 = (name, options) => find$1(byName$2(name), options);
const byProps$1 = (props, options) => find$1(byProps$2(...props), options);
const byProtos$1 = (protos, options) => find$1(byProtos$2(...protos), options);
const bySource$1 = (contents, options) => find$1(bySource$2(...contents), options);
const all$1 = {
    find: (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
        first: false,
        defaultExport: resolve,
        searchExports: entries
    }) ?? [],
    query: (query, options) => all$1.find(query$2(query), options),
    byName: (name, options) => all$1.find(byName$2(name), options),
    byProps: (props, options) => all$1.find(byProps$2(...props), options),
    byProtos: (protos, options) => all$1.find(byProtos$2(...protos), options),
    bySource: (contents, options) => all$1.find(bySource$2(...contents), options)
};
const demangle = (mapping, required, resolve = true) => {
    const req = required ?? Object.keys(mapping);
    const found = find$1((exports) => (exports instanceof Object
        && exports !== window
        && req.every((req) => {
            const filter = mapping[req];
            return typeof filter === "string"
                ? filter in exports
                : Object.values(exports).some((value) => filter(value));
        })));
    return resolve ? Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        typeof filter === "string" ? found?.[filter] : Object.values(found ?? {}).find((value) => filter(value))
    ])) : found;
};

const finder = {
    __proto__: null,
    find: find$1,
    query: query$1,
    byName: byName$1,
    byProps: byProps$1,
    byProtos: byProtos$1,
    bySource: bySource$1,
    all: all$1,
    demangle
};

const ChannelStore = /* @__PURE__ */ byName$1("ChannelStore");
const ChannelActions = /* @__PURE__ */ byProps$1(["selectChannel"]);
const SelectedChannelStore = /* @__PURE__ */ byName$1("SelectedChannelStore");
const VoiceStateStore = /* @__PURE__ */ byName$1("VoiceStateStore");

const Platforms = /* @__PURE__ */ byProps$1(["getPlatform", "isWindows", "isWeb", "PlatformTypes"]);
const ClientActions = /* @__PURE__ */ byProps$1(["toggleGuildFolderExpand"]);
const UserSettings = /* @__PURE__ */ byProps$1(["MessageDisplayCompact"]);
const LocaleStore = /* @__PURE__ */ byName$1("LocaleStore");
const ThemeStore = /* @__PURE__ */ byName$1("ThemeStore");
const ContextMenuActions = /* @__PURE__ */ byProps$1(["openContextMenuLazy"]);
const ModalActions = /* @__PURE__ */ byProps$1(["openModalLazy"]);
const MediaEngineStore = /* @__PURE__ */ byName$1("MediaEngineStore");
const MediaEngineActions = /* @__PURE__ */ byProps$1(["setLocalVolume"]);

const OldFlux = /* @__PURE__ */ byProps$1(["Store"]);
const Flux = {
    default: OldFlux,
    Store: OldFlux?.Store,
    Dispatcher: /* @__PURE__ */ byProtos$1(["dispatch", "unsubscribe"], { entries: true }),
    useStateFromStores: /* @__PURE__ */ bySource$1(["useStateFromStores"], { entries: true })
};
const Dispatcher = /* @__PURE__ */ byProps$1(["dispatch", "subscribe"]);

const Constants = /* @__PURE__ */ byProps$1(["Permissions", "RelationshipTypes"]);
const i18n = /* @__PURE__ */ byProps$1(["languages", "getLocale"]);

const GuildStore = /* @__PURE__ */ byName$1("GuildStore");
const GuildActions = /* @__PURE__ */ byProps$1(["requestMembers"]);
const GuildMemberStore = /* @__PURE__ */ byName$1("GuildMemberStore");

const MessageStore = /* @__PURE__ */ byName$1("MessageStore");
const MessageActions = /* @__PURE__ */ byProps$1(["jumpToMessage", "_sendMessage"]);

const { React } = BdApi;
const { ReactDOM } = BdApi;
const ReactSpring = /* @__PURE__ */ byProps$1(["SpringContext", "animated"]);
const classNames = /* @__PURE__ */ find$1((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const EventEmitter = /* @__PURE__ */ byProps$1(["subscribe", "emit"]);
const lodash = /* @__PURE__ */ byProps$1(["cloneDeep", "flattenDeep"]);
const semver = /* @__PURE__ */ byProps$1(["SemVer"]);
const moment = /* @__PURE__ */ byProps$1(["utc", "months"]);
const SimpleMarkdown = /* @__PURE__ */ byProps$1(["parseBlock", "parseInline"]);
const hljs = /* @__PURE__ */ byProps$1(["highlight", "highlightBlock"]);
const platform = /* @__PURE__ */ byProps$1(["os", "manufacturer"]);
const lottie = /* @__PURE__ */ byProps$1(["setSubframeRendering"]);

const mapping = {
    Redirect: bySource$2(".computedMatch", ".to"),
    Route: bySource$2(".computedMatch", ".location"),
    Router: byProps$2("computeRootMatch"),
    Switch: bySource$2(".cloneElement"),
    withRouter: bySource$2("withRouter("),
    RouterContext: byName$2("Router")
};
const Router = /* @__PURE__ */ demangle(mapping, ["withRouter"]);

const UserStore = /* @__PURE__ */ byName$1("UserStore");
const PresenceStore = /* @__PURE__ */ byName$1("PresenceStore");
const RelationshipStore = /* @__PURE__ */ byName$1("RelationshipStore");

const Modules = {
    __proto__: null,
    Flux,
    Dispatcher,
    ChannelStore,
    ChannelActions,
    SelectedChannelStore,
    VoiceStateStore,
    Platforms,
    ClientActions,
    UserSettings,
    LocaleStore,
    ThemeStore,
    ContextMenuActions,
    ModalActions,
    MediaEngineStore,
    MediaEngineActions,
    Constants,
    i18n,
    GuildStore,
    GuildActions,
    GuildMemberStore,
    MessageStore,
    MessageActions,
    React,
    ReactDOM,
    ReactSpring,
    classNames,
    EventEmitter,
    lodash,
    semver,
    moment,
    SimpleMarkdown,
    hljs,
    platform,
    lottie,
    Router,
    UserStore,
    PresenceStore,
    RelationshipStore
};

class Settings extends Flux.Store {
    constructor(Data, defaults) {
        super(new Flux.Dispatcher(), {
            update: () => {
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
    _dispatch() {
        this._dispatcher.dispatch({ type: "update" });
    }
    update(settings) {
        Object.assign(this.current, typeof settings === "function" ? settings(this.current) : settings);
        this._dispatch();
    }
    reset() {
        this.current = { ...this.defaults };
        this._dispatch();
    }
    delete(...keys) {
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch();
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
                BdApi.DOM.addStyle(id, styles);
            }
        },
        clear: () => BdApi.DOM.removeStyle(id)
    };
};

const Flex = /* @__PURE__ */ byProps$1(["Child", "Justify"], { entries: true });

const Button = /* @__PURE__ */ byProps$1(["Colors", "Link"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$2(".titleClassName", ".sectionTitle"),
    FormItem: bySource$2(".titleClassName", ".required"),
    FormTitle: bySource$2(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$2(".divider", ".style", "\"div\""),
    FormNotice: bySource$2(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormText"]);

const { Menu: Menu, Group: MenuGroup, Item: MenuItem, Separator: MenuSeparator, CheckboxItem: MenuCheckboxItem, RadioItem: MenuRadioItem, ControlItem: MenuControlItem } = BdApi.ContextMenu;

const RadioGroup = /* @__PURE__ */ bySource$1([".radioItemClassName", ".options"], { entries: true });

const Slider = /* @__PURE__ */ bySource$1([".asValueChanges"], { entries: true });

const SwitchItem = /* @__PURE__ */ bySource$1([".helpdeskArticleId"], { entries: true });
const Switch = /* @__PURE__ */ bySource$1([".onChange", ".focusProps"], { entries: true });

const { TextInput, TextInputError } = /* @__PURE__ */ demangle({
    TextInput: (target) => target.defaultProps?.type === "text",
    TextInputError: bySource$2(".error", "text-danger")
}, ["TextInput"]);

const Text = /* @__PURE__ */ bySource$1([".lineClamp", ".variant"], { entries: true });

const Clickable = /* @__PURE__ */ byName$1("Clickable");
const Links = /* @__PURE__ */ byProps$1(["Link", "NavLink"]);
const margins = /* @__PURE__ */ byProps$1(["marginLarge"]);

const Components = {
    __proto__: null,
    Clickable,
    Links,
    margins,
    Flex,
    Button,
    FormSection,
    FormItem,
    FormTitle,
    FormText,
    FormDivider,
    FormNotice,
    Menu,
    MenuGroup,
    MenuItem,
    MenuSeparator,
    MenuCheckboxItem,
    MenuRadioItem,
    MenuControlItem,
    RadioGroup,
    Slider,
    SwitchItem,
    Switch,
    TextInput,
    TextInputError,
    Text
};

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const alert = (title, content) => BdApi.UI.alert(title, content);
const confirm = (title, content, options = {}) => BdApi.UI.showConfirmationModal(title, content, options);
const toast = (content, options) => BdApi.UI.showToast(content, options);

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
const findOwner = (fiber, depth = 50) => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up" , depth);
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
    sleep,
    alert,
    confirm,
    toast,
    queryTree,
    queryTreeAll,
    getFiber,
    queryFiber,
    findOwner,
    forceUpdateOwner,
    forceFullRerender
};

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(FormSection, null,
    children,
    React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

const require$1 = {
    __proto__: null
};

const version = "0.3.0";

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

const dium = {
    __proto__: null,
    createPlugin,
    Filters: filters,
    Finder: finder,
    ReactInternals,
    ReactDOMInternals,
    Utils: index$1,
    Webpack: require$1,
    React,
    ReactDOM,
    Flux,
    version
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
const query = (query) => find(query$2(query));
const byId = (id) => webpackRequire.c[id] ?? null;
const byExports = (exported) => find(byExportsFilter(exported));
const byName = (name) => find(byName$2(name));
const byProps = (...props) => find(byProps$2(...props));
const byProtos = (...protos) => find(byProtos$2(...protos));
const bySource = (...contents) => find(bySource$2(...contents));
const byModuleSource = (...contents) => find(byModuleSourceFilter(contents));
const all = {
    find: (...filters) => modules().filter(applyFilters(filters)),
    query: (query) => all.find(query$2(query)),
    byExports: (exported) => all.find(byExportsFilter(exported)),
    byName: (name) => all.find(byName$2(name)),
    byProps: (...props) => all.find(byProps$2(...props)),
    byProtos: (...protos) => all.find(byProtos$2(...protos)),
    bySource: (...contents) => all.find(bySource$2(...contents)),
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
    modules,
    sources,
    sourceOf,
    find,
    query,
    byId,
    byExports,
    byName,
    byProps,
    byProtos,
    bySource,
    byModuleSource,
    all,
    resolveImportIds,
    resolveImports,
    resolveStyles,
    resolveUsersById,
    resolveUsers
};

const diumGlobal = {
    ...dium,
    Finder: { ...finder, dev: DevFinder },
    Modules,
    Components
};
const index = createPlugin({}, () => ({
    start() {
        window.dium = diumGlobal;
    },
    stop() {
        delete window.dium;
    }
}));

module.exports = index;

/*@end @*/
