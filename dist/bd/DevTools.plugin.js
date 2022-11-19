/**
 * @name DevTools
 * @author Zerthox
 * @version 0.5.0
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
const deleteEntry = (key) => BdApi.Data.delete(getMeta().name, key);

const data = {
    __proto__: null,
    load,
    save,
    deleteEntry
};

const join = (...filters) => {
    return ((...args) => filters.every((filter) => filter(...args)));
};
const query$2 = ({ filter, name, props, protos, source }) => join(...[
    ...[filter].flat(),
    typeof name === "string" ? byName$2(name) : null,
    props instanceof Array ? byProps$2(...props) : null,
    protos instanceof Array ? byProtos$2(...protos) : null,
    source instanceof Array ? bySource$2(...source) : null
].filter(Boolean));
const byEntry = (filter, every = false) => {
    return ((target, ...args) => {
        if (target instanceof Object && target !== window) {
            const values = Object.values(target);
            return values.length > 0 && values[every ? "every" : "some"]((value) => filter(value, ...args));
        }
        else {
            return false;
        }
    });
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
        else if (target instanceof Object && "$$typeof" in target) {
            const source = (target.render ?? target.type)?.toString();
            return source && fragments.every((fragment) => typeof fragment === "string" ? source.includes(fragment) : fragment(source));
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

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration));
const alert = (title, content) => BdApi.UI.alert(title, content);
const confirm = (title, content, options = {}) => BdApi.UI.showConfirmationModal(title, content, options);
const toast = (content, options) => BdApi.UI.showToast(content, options);
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

const find$1 = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});
const query$1 = (query, options) => find$1(query$2(query), options);
const byEntries = (...filters$1) => find$1(join(...filters$1.map((filter) => byEntry(filter))));
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
const resolveKey = (target, filter) => [target, Object.entries(target ?? {}).find(([, value]) => filter(value))?.[0]];
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find$1((target) => (target instanceof Object
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

const finder = {
    __proto__: null,
    find: find$1,
    query: query$1,
    byEntries,
    byName: byName$1,
    byProps: byProps$1,
    byProtos: byProtos$1,
    bySource: bySource$1,
    all: all$1,
    resolveKey,
    demangle
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

const lazy = {
    __proto__: null,
    waitFor,
    abort
};

const COLOR = "#3a71c1";
const print = (output, ...data) => output(`%c[${getMeta().name}] %c${getMeta().version ? `(v${getMeta().version})` : ""}`, `color: ${COLOR}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
const log = (...data) => print(console.log, ...data);
const warn = (...data) => print(console.warn, ...data);
const error = (...data) => print(console.error, ...data);

const logger = {
    __proto__: null,
    print,
    log,
    warn,
    error
};

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
const instead = (object, method, callback, options = {}) => patch("instead", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options);
const before = (object, method, callback, options = {}) => patch("before", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options);
const after = (object, method, callback, options = {}) => patch("after", object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options);
let menuPatches = [];
const contextMenu = (navId, callback, options = {}) => {
    const cancel = BdApi.ContextMenu.patch(navId, options.once ? (tree) => {
        const result = callback(tree);
        cancel();
        return result;
    } : callback);
    menuPatches.push(cancel);
    if (!options.silent) {
        log(`Patched ${options.name ?? `"${navId}"`} context menu`);
    }
    return cancel;
};
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

const patcher = {
    __proto__: null,
    instead,
    before,
    after,
    contextMenu,
    unpatchAll
};

const inject = (styles) => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
    }
};
const clear = () => BdApi.DOM.removeStyle(getMeta().name);

const styles = {
    __proto__: null,
    inject,
    clear
};

const ChannelStore = /* @__PURE__ */ byName$1("ChannelStore");
const ChannelActions = /* @__PURE__ */ byProps$1(["selectChannel"]);
const SelectedChannelStore = /* @__PURE__ */ byName$1("SelectedChannelStore");
const VoiceStateStore = /* @__PURE__ */ byName$1("VoiceStateStore");

const Platforms = /* @__PURE__ */ find$1(byEntry(byProps$2("WINDOWS", "WEB")));
const ClientActions = /* @__PURE__ */ byProps$1(["toggleGuildFolderExpand"]);
const UserSettings = /* @__PURE__ */ find$1(byEntry(byProps$2("updateSetting"), true));
const LocaleStore = /* @__PURE__ */ byName$1("LocaleStore");
const ThemeStore = /* @__PURE__ */ byName$1("ThemeStore");
const MediaEngineStore = /* @__PURE__ */ byName$1("MediaEngineStore");
const MediaEngineActions = /* @__PURE__ */ byProps$1(["setLocalVolume"]);

const { ComponentDispatch, ComponentDispatcher } = /* @__PURE__ */ demangle({
    ComponentDispatch: byProps$2("dispatchToLastSubscribed"),
    ComponentDispatcher: byProtos$2("dispatchToLastSubscribed")
});

const Dispatcher = /* @__PURE__ */ byProps$1(["dispatch", "subscribe"]);
const Flux = /* @__PURE__ */ demangle({
    default: byProps$2("Store", "connectStores"),
    Dispatcher: byProtos$2("dispatch"),
    Store: byProtos$2("emitChange"),
    BatchedStoreListener: byProtos$2("attach", "detach"),
    useStateFromStores: bySource$2("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

const Constants = /* @__PURE__ */ byProps$1(["Permissions", "RelationshipTypes"]);
const i18n = /* @__PURE__ */ byProps$1(["languages", "getLocale"]);

const GuildStore = /* @__PURE__ */ byName$1("GuildStore");
const GuildActions = /* @__PURE__ */ byProps$1(["requestMembers"]);
const GuildMemberStore = /* @__PURE__ */ byName$1("GuildMemberStore");
const SortedGuildStore = /* @__PURE__ */ byName$1("SortedGuildStore");
const ExpandedGuildFolderStore = /* @__PURE__ */ byName$1("ExpandedGuildFolderStore");

const MessageStore = /* @__PURE__ */ byName$1("MessageStore");
const MessageActions = /* @__PURE__ */ byProps$1(["jumpToMessage", "_sendMessage"]);

const { React } = BdApi;
const { ReactDOM } = BdApi;
const ReactSpring = /* @__PURE__ */ byProps$1(["SpringContext", "animated"]);
const classNames = /* @__PURE__ */ find$1((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const EventEmitter = /* @__PURE__ */ find$1((exports) => exports.prototype instanceof Object && Object.prototype.hasOwnProperty.call(exports.prototype, "prependOnceListener"));
const lodash = /* @__PURE__ */ byProps$1(["cloneDeep", "flattenDeep"]);
const Immutable = /* @__PURE__ */ byProps$1(["OrderedSet"]);
const semver = /* @__PURE__ */ byProps$1(["SemVer"]);
const moment = /* @__PURE__ */ byProps$1(["utc", "months"]);
const SimpleMarkdown = /* @__PURE__ */ byProps$1(["parseBlock", "parseInline"]);
const hljs = /* @__PURE__ */ byProps$1(["highlight", "highlightBlock"]);
const platform = /* @__PURE__ */ byProps$1(["os", "manufacturer"]);
const lottie = /* @__PURE__ */ byProps$1(["setSubframeRendering"]);
const stemmer = /* @__PURE__ */ bySource$1([".test", ".exec", ".substr"]);

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
    ChannelStore,
    ChannelActions,
    SelectedChannelStore,
    VoiceStateStore,
    Platforms,
    ClientActions,
    UserSettings,
    LocaleStore,
    ThemeStore,
    MediaEngineStore,
    MediaEngineActions,
    ComponentDispatch,
    ComponentDispatcher,
    Dispatcher,
    Flux,
    Constants,
    i18n,
    GuildStore,
    GuildActions,
    GuildMemberStore,
    SortedGuildStore,
    ExpandedGuildFolderStore,
    MessageStore,
    MessageActions,
    React,
    ReactDOM,
    ReactSpring,
    classNames,
    EventEmitter,
    lodash,
    Immutable,
    semver,
    moment,
    SimpleMarkdown,
    hljs,
    platform,
    lottie,
    stemmer,
    Router,
    UserStore,
    PresenceStore,
    RelationshipStore
};

const Button = /* @__PURE__ */ byProps$1(["Colors", "Link"], { entries: true });

const Clickable = /* @__PURE__ */ bySource$1([".ignoreKeyPress"], { entries: true });

const Embed = /* @__PURE__ */ byProtos$1(["renderSuppressButton"], { entries: true });

const Flex = /* @__PURE__ */ byProps$1(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$2(".titleClassName", ".sectionTitle"),
    FormItem: bySource$2(".titleClassName", ".required"),
    FormTitle: bySource$2(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$2(".divider", ".style"),
    FormNotice: bySource$2(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormDivider"]);

const GuildsNav = /* @__PURE__ */ bySource$1(["guildsnav"], { entries: true });

const { Link, NavLink, LinkRouter } = /* @__PURE__ */ demangle({
    NavLink: bySource$2(".sensitive", ".to"),
    Link: bySource$2(".component"),
    LinkRouter: bySource$2("this.history")
}, ["NavLink", "Link"]);

const { Menu: Menu, Group: MenuGroup, Item: MenuItem, Separator: MenuSeparator, CheckboxItem: MenuCheckboxItem, RadioItem: MenuRadioItem, ControlItem: MenuControlItem } = BdApi.ContextMenu;

const MessageFooter = /* @__PURE__ */ byProtos$1(["renderRemoveAttachmentConfirmModal"], { entries: true });

const RadioGroup = /* @__PURE__ */ bySource$1([".radioItemClassName", ".options"], { entries: true });

const { Select, SingleSelect } =  demangle({
    Select: bySource$2(".renderOptionLabel", ".renderOptionValue"),
    SingleSelect: bySource$2(".onChange", ".jsx")
}, ["Select"]);

const Slider = /* @__PURE__ */ bySource$1([".asValueChanges"], { entries: true });

const SwitchItem = /* @__PURE__ */ bySource$1([".helpdeskArticleId"], { entries: true });
const Switch = /* @__PURE__ */ bySource$1([".onChange", ".focusProps"], { entries: true });

const { TextInput, TextInputError } = /* @__PURE__ */ demangle({
    TextInput: (target) => target?.defaultProps?.type === "text",
    TextInputError: bySource$2(".error", "text-danger")
}, ["TextInput"]);

const Text = /* @__PURE__ */ bySource$1([".lineClamp", ".variant"], { entries: true });

const margins = /* @__PURE__ */ byProps$1(["marginLarge"]);

const Components = {
    __proto__: null,
    margins,
    Button,
    Clickable,
    Embed,
    Flex,
    FormSection,
    FormItem,
    FormTitle,
    FormText,
    FormDivider,
    FormNotice,
    GuildsNav,
    Link,
    NavLink,
    LinkRouter,
    Menu,
    MenuGroup,
    MenuItem,
    MenuSeparator,
    MenuCheckboxItem,
    MenuRadioItem,
    MenuControlItem,
    MessageFooter,
    RadioGroup,
    Select,
    SingleSelect,
    Slider,
    SwitchItem,
    Switch,
    TextInput,
    TextInputError,
    Text
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

const FCHook = ({ children: { type, props }, callback }) => {
    const result = type(props);
    return callback(result, props) ?? result;
};
const hookFunctionComponent = (target, callback) => {
    const props = {
        children: { ...target },
        callback
    };
    target.props = props;
    target.type = FCHook;
    return target;
};
const queryTree = (node, predicate) => {
    const worklist = [node].flat();
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
    const worklist = [node].flat();
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
const queryTreeForParent = (tree, predicate) => {
    let childIndex = -1;
    const parent = queryTree(tree, (node) => {
        const children = node?.props?.children;
        if (children instanceof Array) {
            const index = children.findIndex(predicate);
            if (index > -1) {
                childIndex = index;
                return true;
            }
        }
    });
    return [parent, childIndex];
};
const getFiber = (node) => ReactDOMInternals.getInstanceFromNode(node ?? {});
const queryFiber = (fiber, predicate, direction = "up" , depth = 30) => {
    if (depth < 0) {
        return null;
    }
    if (predicate(fiber)) {
        return fiber;
    }
    if (direction === "up"  || direction === "both" ) {
        let count = 0;
        let parent = fiber.return;
        while (parent && count < depth) {
            if (predicate(parent)) {
                return parent;
            }
            count++;
            parent = parent.return;
        }
    }
    if (direction === "down"  || direction === "both" ) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, "down" , depth - 1);
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
    mappedProxy,
    hookFunctionComponent,
    queryTree,
    queryTreeAll,
    queryTreeForParent,
    getFiber,
    queryFiber,
    findOwner,
    forceUpdateOwner,
    forceFullRerender
};

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

const version = "0.4.0";

const createPlugin = (plugin) => (meta) => {
    setMeta(meta);
    const { start, stop, styles: styles$1, Settings, SettingsPanel } = (plugin instanceof Function ? plugin(meta) : plugin);
    Settings?.load();
    return {
        start() {
            log("Enabled");
            inject(styles$1);
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

const dium = {
    __proto__: null,
    createPlugin,
    createSettings,
    SettingsStore,
    ReactInternals,
    ReactDOMInternals,
    Utils: index$1,
    React,
    ReactDOM,
    Flux,
    getMeta,
    setMeta,
    version,
    Data: data,
    Filters: filters,
    Finder: finder,
    Lazy: lazy,
    Logger: logger,
    Patcher: patcher,
    Styles: styles
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
    return (target) => target === exported;
};
const byModuleSourceFilter = (contents) => {
    return (_, module) => {
        const source = sourceOf(module.id).toString();
        return contents.every((content) => source.includes(content));
    };
};
const applyFilter = (filter, keys = ["default", "Z", "ZP"]) => (module) => {
    const { exports } = module;
    const check = keys === true ? Object.keys(exports) : (keys === false ? [] : keys);
    return (filter(exports, module, String(module.id))
        || exports instanceof Object
            && check.some((key) => key in exports && filter(exports[key], module, String(module.id))));
};
const modules = () => Object.values(webpackRequire.c);
const sources = () => Object.values(webpackRequire.m);
const sourceOf = (id) => webpackRequire.m[id] ?? null;
const find = (filter, keys) => modules().find(applyFilter(filter, keys)) ?? null;
const query = (query, keys) => find(query$2(query), keys);
const byId = (id) => webpackRequire.c[id] ?? null;
const byExports = (exported, keys) => find(byExportsFilter(exported), keys);
const byName = (name, keys) => find(byName$2(name), keys);
const byProps = (props, keys) => find(byProps$2(...props), keys);
const byProtos = (protos, keys) => find(byProtos$2(...protos), keys);
const bySource = (contents, keys) => find(bySource$2(...contents), keys);
const byModuleSource = (contents) => find(byModuleSourceFilter(contents));
const all = {
    find: (filter, keys) => modules().filter(applyFilter(filter, keys)),
    query: (query, keys) => all.find(query$2(query), keys),
    byExports: (exported, keys) => all.find(byExportsFilter(exported), keys),
    byName: (name, keys) => all.find(byName$2(name), keys),
    byProps: (props, keys) => all.find(byProps$2(...props), keys),
    byProtos: (protos, keys) => all.find(byProtos$2(...protos), keys),
    bySource: (contents, keys) => all.find(bySource$2(...contents), keys),
    byModuleSource: (contents) => all.find(byModuleSourceFilter(contents))
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

const { Logger } = dium;
const diumGlobal = {
    ...dium,
    Finder: { ...finder, dev: DevFinder },
    Modules,
    Components
};
const checkForMissing = (type, toCheck) => {
    const missing = Object.entries(toCheck)
        .filter(([, value]) => value === undefined || value === null)
        .map(([key]) => key);
    if (missing.length > 0) {
        Logger.warn(`Missing ${type}: ${missing.join(", ")}`);
    }
    else {
        Logger.log(`All ${type} found`);
    }
};
const index = createPlugin({
    start() {
        window.dium = diumGlobal;
        checkForMissing("modules", Modules);
        checkForMissing("components", Components);
    },
    stop() {
        delete window.dium;
    }
});

module.exports = index;

/*@end @*/
