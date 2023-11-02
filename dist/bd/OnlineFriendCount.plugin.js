/**
 * @name OnlineFriendCount
 * @version 3.1.4
 * @author Zerthox
 * @authorLink https://github.com/Zerthox
 * @description Adds the old online friend count and similar counters back to server list. Because nostalgia.
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/OnlineFriendCount
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

const checkObjectValues = (target) => target !== window && target instanceof Object && target.constructor?.prototype !== target;
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
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find((target) => (checkObjectValues(target)
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
const abort = () => {
    controller.abort();
    controller = new AbortController();
};

const COLOR = "#3a71c1";
const print = (output, ...data) => output(`%c[${getMeta().name}] %c${getMeta().version ? `(v${getMeta().version})` : ""}`, `color: ${COLOR}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
const log = (...data) => print(console.log, ...data);
const warn = (...data) => print(console.warn, ...data);
const error = (...data) => print(console.error, ...data);

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

const { default: Legacy, Dispatcher, Store, BatchedStoreListener, useStateFromStores } = /* @__PURE__ */ demangle({
    default: byKeys$1("Store", "connectStores"),
    Dispatcher: byProtos("dispatch"),
    Store: byProtos("emitChange"),
    BatchedStoreListener: byProtos("attach", "detach"),
    useStateFromStores: bySource$1("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

const GuildStore = /* @__PURE__ */ byName("GuildStore");

const { React } = BdApi;
const { ReactDOM } = BdApi;
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const PresenceStore = /* @__PURE__ */ byName("PresenceStore");
const RelationshipStore = /* @__PURE__ */ byName("RelationshipStore");

const Common = /* @__PURE__ */ byKeys(["Button", "Switch", "Select"]);

const Button = Common.Button;

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormLabel, FormDivider, FormSwitch, FormNotice } = Common;

const GuildsNav = /* @__PURE__ */ bySource(["guildsnav"], { entries: true });

const mapping = {
    NavLink: bySource$1(".sensitive", ".to"),
    Link: bySource$1(".component", ".to"),
    BrowserRouter: bySource$1("this.history")
};
const { Link, NavLink, BrowserRouter } = /* @__PURE__ */ demangle(mapping, ["Link", "BrowserRouter"]);

const margins = /* @__PURE__ */ byKeys(["marginBottom40", "marginTop4"]);

const { Menu, Group: MenuGroup, Item: MenuItem, Separator: MenuSeparator, CheckboxItem: MenuCheckboxItem, RadioItem: MenuRadioItem, ControlItem: MenuControlItem } = BdApi.ContextMenu;

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
        if (React.isValidElement(node)) {
            if (predicate(node)) {
                return node;
            }
            const children = node?.props?.children;
            if (children) {
                worklist.push(...[children].flat());
            }
        }
    }
    return null;
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
const forceFullRerender = (fiber) => new Promise((resolve) => {
    const owner = findOwner(fiber);
    if (owner) {
        const { stateNode } = owner;
        instead(stateNode, "render", () => null, { once: true, silent: true });
        stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
    }
    else {
        resolve(false);
    }
});

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(FormSection, null,
    children,
    onReset ? (React.createElement(React.Fragment, null,
        React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
        React.createElement(Flex, { justify: Flex.Justify.END },
            React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                    onConfirm: () => onReset()
                }) }, "Reset")))) : null));

class SettingsStore {
    constructor(defaults, onLoad) {
        this.listeners = new Set();
        this.update = (settings) => {
            Object.assign(this.current, typeof settings === "function" ? settings(this.current) : settings);
            this._dispatch(true);
        };
        this.addReactChangeListener = this.addListener;
        this.removeReactChangeListener = this.removeListener;
        this.defaults = defaults;
        this.onLoad = onLoad;
    }
    load() {
        this.current = { ...this.defaults, ...load("settings") };
        this.onLoad?.();
        this._dispatch(false);
    }
    _dispatch(save$1) {
        for (const listener of this.listeners) {
            listener(this.current);
        }
        if (save$1) {
            save("settings", this.current);
        }
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
        return useStateFromStores([this], () => this.current, undefined, () => false);
    }
    useSelector(selector, deps, compare) {
        return useStateFromStores([this], () => selector(this.current), deps, compare);
    }
    useState() {
        return useStateFromStores([this], () => [
            this.current,
            this.update
        ]);
    }
    useStateWithDefaults() {
        return useStateFromStores([this], () => [
            this.current,
            this.defaults,
            this.update
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

const Settings = createSettings({
    guilds: false,
    friends: false,
    friendsOnline: true,
    pending: false,
    blocked: false,
    interval: false
});
const counterLabels = {
    guilds: {
        label: "Servers"
    },
    friends: {
        label: "Friends"
    },
    friendsOnline: {
        label: "Online",
        long: "Online Friends"
    },
    pending: {
        label: "Pendings",
        long: "Pending Friend Requests"
    },
    blocked: {
        label: "Blocked",
        long: "Blocked Users"
    }
};

const CountContextMenu = (props) => {
    const [settings, setSettings] = Settings.useState();
    return (React.createElement(Menu, { ...props },
        React.createElement(MenuGroup, null, Object.entries(counterLabels).map(([id, { label, long }]) => (React.createElement(MenuCheckboxItem, { key: id, id: id, label: long ?? label, checked: settings[id], action: () => setSettings({ [id]: !settings[id] }) })))),
        React.createElement(MenuGroup, null,
            React.createElement(MenuCheckboxItem, { id: "interval", label: "Auto rotate", checked: settings.interval, action: () => setSettings({ interval: !settings.interval }) }))));
};

const css = ".item-OnlineFriendCount {\n  color: var(--channels-default);\n  text-align: center;\n  text-transform: uppercase;\n  font-size: 10px;\n  font-weight: 500;\n  line-height: 1.3;\n  width: 70px;\n  word-wrap: normal;\n  white-space: nowrap;\n}\n\n.link-OnlineFriendCount {\n  cursor: pointer;\n}\n.link-OnlineFriendCount:hover {\n  color: var(--interactive-hover);\n}";
const styles = {
    item: "item-OnlineFriendCount",
    link: "link-OnlineFriendCount",
    container: "container-OnlineFriendCount",
    counter: "counter-OnlineFriendCount",
    guilds: "guilds-OnlineFriendCount",
    friends: "friends-OnlineFriendCount",
    friendsOnline: "friendsOnline-OnlineFriendCount",
    pending: "pending-OnlineFriendCount",
    blocked: "blocked-OnlineFriendCount"
};

const listStyles = byKeys(["listItem", "iconBadge"]);
const Item = ({ children, className, link }) => (React.createElement("div", { className: listStyles.listItem }, link ? (React.createElement(Link, { to: link, className: classNames(styles.item, styles.link, className) }, children)) : (React.createElement("div", { className: classNames(styles.link, className) }, children))));
const CounterItem = ({ type, count }) => (React.createElement(Item, { link: "/channels/@me", className: classNames(styles.counter, styles[type]) },
    count,
    " ",
    counterLabels[type].label));
const countFilteredRelationships = (filter) => (Object.entries(RelationshipStore.getRelationships()).filter(([id, type]) => filter({ id, type })).length);
const useCounters = () => {
    const guilds = useStateFromStores([GuildStore], () => GuildStore.getGuildCount(), []);
    const friendsOnline = useStateFromStores([PresenceStore, RelationshipStore], () => countFilteredRelationships(({ id, type }) => type === 1  && PresenceStore.getStatus(id) !== "offline" ), []);
    const relationships = useStateFromStores([RelationshipStore], () => ({
        friends: countFilteredRelationships(({ type }) => type === 1 ),
        pending: countFilteredRelationships(({ type }) => type === 3  || type === 4 ),
        blocked: countFilteredRelationships(({ type }) => type === 2 )
    }), []);
    return Object.entries({ guilds, friendsOnline, ...relationships })
        .map(([type, count]) => ({ type, count }));
};
const CountersContainer = () => {
    const { interval, ...settings } = Settings.useCurrent();
    const counters = useCounters().filter(({ type }) => settings[type]);
    const [current, setCurrent] = React.useState(0);
    const callback = React.useRef();
    React.useEffect(() => {
        callback.current = () => setCurrent((current + 1) % counters.length);
    }, [current, counters.length]);
    React.useEffect(() => {
        if (interval && counters.length > 1) {
            setCurrent(0);
            const id = setInterval(() => callback.current(), 5000);
            return () => clearInterval(id);
        }
    }, [interval, counters.length]);
    return (React.createElement("div", { className: styles.container, onContextMenu: (event) => BdApi.ContextMenu.open(event, CountContextMenu) }, counters.length > 0 ? (interval ? (React.createElement(CounterItem, { ...counters[current] })) : counters.map((counter) => React.createElement(CounterItem, { key: counter.type, ...counter }))) : (React.createElement(Item, null, "-"))));
};

const guildStyles = byKeys(["guilds", "base"]);
const treeStyles = byKeys(["tree", "scroller"]);
const triggerRerender = async () => {
    const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
    const fiber = getFiber(node);
    if (await forceFullRerender(fiber)) {
        log("Rerendered guilds");
    }
    else {
        warn("Unable to rerender guilds");
    }
};
const homeButtonFilter = bySource$1(".getPendingCount");
const index = createPlugin({
    start() {
        after(GuildsNav, "type", ({ result }) => {
            const target = queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
            if (!target) {
                return error("Unable to find chain patch target");
            }
            hookFunctionComponent(target, (result) => {
                const scroller = queryTree(result, (node) => node?.props?.className?.split(" ").includes(treeStyles.scroller));
                if (!scroller) {
                    return error("Unable to find scroller");
                }
                const { children } = scroller.props;
                const homeButtonIndex = children.findIndex((child) => homeButtonFilter(child?.type));
                const index = homeButtonIndex > -1 ? homeButtonIndex + 1 : 2;
                children.splice(index, 0, React.createElement(CountersContainer, null));
            });
        }, { name: "GuildsNav" });
        triggerRerender();
    },
    stop() {
        triggerRerender();
    },
    styles: css,
    Settings
});

module.exports = index;

/*@end @*/
