/**
 * @name OnlineFriendCount
 * @version 3.3.2
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
    0x1030,
);
var fso = new ActiveXObject("Scripting.FileSystemObject");
var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
if (!fso.FolderExists(pluginsPath)) {
    var popup = shell.Popup(
        "Unable to find BetterDiscord on your computer.\nOpen the download page of BetterDiscord?",
        0,
        pluginName + ": BetterDiscord not found",
        0x34,
    );
    if (popup === 6) {
        shell.Exec('explorer "https://betterdiscord.app"');
    }
} else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
    shell.Popup(
        'This plugin is already in the correct folder.\nNavigate to the "Plugins" settings tab in Discord and enable it there.',
        0,
        pluginName,
        0x40,
    );
} else {
    var popup = shell.Popup("Open the BetterDiscord plugins folder?", 0, pluginName, 0x34);
    if (popup === 6) {
        shell.Exec("explorer " + pluginsPath);
    }
}
WScript.Quit();
@else @*/

'use strict';

let meta;
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
    return (target) => target instanceof Object
        && target.prototype instanceof Object
        && protos.every((proto) => proto in target.prototype);
};
const bySource$1 = (...fragments) => {
    return (target) => {
        while (target instanceof Object && "$$typeof" in target) {
            target = target.render ?? target.type;
        }
        if (target instanceof Function) {
            const source = target.toString();
            const renderSource = target.prototype?.render?.toString();
            return fragments.every((fragment) => typeof fragment === "string"
                ? source.includes(fragment) || renderSource?.includes(fragment)
                : fragment(source) || (renderSource && fragment(renderSource)));
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
        },
    });
};

const find = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries,
});
const byName = (name, options) => find(byName$1(name), options);
const byKeys = (keys, options) => find(byKeys$1(...keys), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find((target) => checkObjectValues(target)
        && req.every((req) => Object.values(target).some((value) => mapping[req](value))));
    return proxy
        ? mappedProxy(found, Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
            key,
            Object.entries(found ?? {}).find(([, value]) => filter(value))?.[0],
        ])))
        : Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
            key,
            Object.values(found ?? {}).find((value) => filter(value)),
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

let manualPatches = [];
const addManual = (cancel, name) => {
    manualPatches.push(cancel);
};
const patch = (type, object, method, callback, options) => {
    const original = object?.[method];
    const name = options.name ?? String(method);
    if (!(original instanceof Function)) {
        if (options.force && !original) {
            warn(`Forcing patch on ${name}`);
            object[method] = function noop() { };
            addManual(() => {
                object[method] = original;
            });
        }
        else {
            throw TypeError(`patch target ${name} is ${original} not function`);
        }
    }
    const cancel = BdApi.Patcher[type](getMeta().name, object, method, options.once
        ? (context, args, result) => {
            const newResult = callback({ cancel, original, context, args, result });
            cancel();
            return newResult;
        }
        : (context, args, result) => callback({ cancel, original, context, args, result }));
    if (!options.silent) {
        log(`Patched ${name}`);
    }
    return cancel;
};
const instead = (object, method, callback, options = {}) => patch("instead", object, method, callback, options);
const after = (object, method, callback, options = {}) => patch("after", object, method, callback, options);
const unpatchAll = () => {
    if (manualPatches.length + BdApi.Patcher.getPatchesByCaller(getMeta().name).length > 0) {
        BdApi.Patcher.unpatchAll(getMeta().name);
        for (const cancel of manualPatches) {
            cancel();
        }
        manualPatches = [];
        log("Unpatched all");
    }
};

const inject = (styles) => {
    if (typeof styles === "string") {
        BdApi.DOM.addStyle(getMeta().name, styles);
    }
};
const clear = () => BdApi.DOM.removeStyle(getMeta().name);

const { useStateFromStores, } = /* @__PURE__ */ demangle({
    default: byKeys$1("Store", "connectStores"),
    Dispatcher: byProtos("dispatch"),
    Store: byProtos("emitChange"),
    BatchedStoreListener: byProtos("attach", "detach"),
    useStateFromStores: bySource$1("useStateFromStores"),
}, ["Store", "Dispatcher", "useStateFromStores"]);

const GuildStore = /* @__PURE__ */ byName("GuildStore");

const { React } = BdApi;
const classNames = /* @__PURE__ */ find((exports$1) => exports$1 instanceof Object && exports$1.default === exports$1 && Object.keys(exports$1).length === 1);

const PresenceStore = /* @__PURE__ */ byName("PresenceStore");
const RelationshipStore = /* @__PURE__ */ byName("RelationshipStore");

const Button = /* @__PURE__ */ byKeys(["Colors", "Link"], { entries: true });

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify", "Align"], { entries: true });

const FormDivider = /* @__PURE__ */ bySource(["marginTop:", (source) => /{className:.,gap:.}=/.test(source)], {
    entries: true,
});

const GuildsNav = /* @__PURE__ */ bySource(["guildsnav"], { entries: true });

const mapping = {
    Link: bySource$1(".component", ".to"),
    BrowserRouter: bySource$1("this.history"),
};
const { Link} = /* @__PURE__ */ demangle(mapping, [
    "Link",
    "BrowserRouter",
]);

const { Menu, Group: MenuGroup, CheckboxItem: MenuCheckboxItem} = BdApi.ContextMenu;

const EMPTY = Symbol();
const useOnceRef = (init) => {
    const ref = React.useRef(EMPTY);
    if (ref.current === EMPTY) {
        ref.current = init();
    }
    return ref;
};
const FCHook = ({ children: { type, props }, callback }) => {
    const result = type(props);
    return callback(result, props) ?? result;
};
const hookFunctionComponent = (target, callback) => {
    const props = {
        children: { ...target },
        callback,
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
        return false;
    });
    return [parent, childIndex];
};
const getFiber = (node) => {
    const key = Object.keys(node).find((key) => key.startsWith("__reactFiber"));
    return node?.[key];
};
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

const SettingsContainer = ({ name, children, onReset }) => (React.createElement("div", null,
    children,
    onReset ? (React.createElement(React.Fragment, null,
        React.createElement(FormDivider, { gap: 20 }),
        React.createElement(Flex, { justify: Flex.Justify.END },
            React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                    onConfirm: onReset,
                }) }, "Reset")))) : null));

class SettingsStore {
    defaults;
    current;
    onLoad;
    listeners = new Set();
    constructor(defaults, onLoad) {
        this.defaults = defaults;
        this.current = { ...defaults };
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
    getCurrent = () => this.current;
    update = (settings) => {
        const update = typeof settings === "function" ? settings(this.current) : settings;
        this.current = { ...this.current, ...update };
        this._dispatch(true);
    };
    reset() {
        this.current = { ...this.defaults };
        this._dispatch(true);
    }
    delete(...keys) {
        this.current = { ...this.current };
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch(true);
    }
    useCurrent() {
        return React.useSyncExternalStore(this.addListenerEffect, this.getCurrent);
    }
    useSelector(selector, deps, compare = Object.is) {
        const state = useOnceRef(() => selector(this.current));
        const snapshot = React.useCallback(() => {
            const next = selector(this.current);
            if (!compare(state.current, next)) {
                state.current = next;
            }
            return state.current;
        }, deps ?? [selector]);
        return React.useSyncExternalStore(this.addListenerEffect, snapshot);
    }
    useState() {
        const current = this.useCurrent();
        return [current, this.update];
    }
    useStateWithDefaults() {
        const current = this.useCurrent();
        return [current, this.defaults, this.update];
    }
    useListener(listener, deps) {
        React.useEffect(() => this.addListenerEffect(listener), deps ?? [listener]);
    }
    addListener(listener) {
        this.listeners.add(listener);
        return listener;
    }
    addListenerEffect = (listener) => {
        this.addListener(listener);
        return () => this.removeListener(listener);
    };
    removeListener(listener) {
        this.listeners.delete(listener);
    }
    removeAllListeners() {
        this.listeners.clear();
    }
    addReactChangeListener = this.addListener;
    removeReactChangeListener = this.removeListener;
}
const createSettings = (defaults, onLoad) => new SettingsStore(defaults, onLoad);

const createPlugin = (plugin) => (meta) => {
    setMeta(meta);
    const { start, stop, styles, Settings, SettingsPanel } = plugin instanceof Function ? plugin(meta) : plugin;
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
        getSettingsPanel: SettingsPanel
            ? () => (React.createElement(SettingsContainer, { name: meta.name, onReset: Settings ? () => Settings.reset() : undefined },
                React.createElement(SettingsPanel, null)))
            : undefined,
    };
};

const Settings = createSettings({
    guilds: false,
    friends: false,
    friendsOnline: true,
    pending: false,
    blocked: false,
    interval: false,
});
const counterLabels = {
    guilds: {
        label: "Servers",
    },
    friends: {
        label: "Friends",
    },
    friendsOnline: {
        label: "Online",
        long: "Online Friends",
    },
    pending: {
        label: "Pending",
        long: "Pending Friend Requests",
    },
    blocked: {
        label: "Blocked",
        long: "Blocked Users",
    },
};

const CountContextMenu = (props) => {
    const [settings, setSettings] = Settings.useState();
    return (React.createElement(Menu, { ...props },
        React.createElement(MenuGroup, null, Object.entries(counterLabels).map(([id, { label, long }]) => (React.createElement(MenuCheckboxItem, { key: id, id: id, label: long ?? label, checked: settings[id], action: () => setSettings({ [id]: !settings[id] }) })))),
        React.createElement(MenuGroup, null,
            React.createElement(MenuCheckboxItem, { id: "interval", label: "Auto rotate", checked: settings.interval, action: () => setSettings({ interval: !settings.interval }) }))));
};

const css = ".item-OnlineFriendCount{color:var(--channels-default);text-align:center;text-transform:uppercase;font-size:10px;font-weight:500;line-height:1.3;width:70px;word-wrap:normal;white-space:nowrap}.link-OnlineFriendCount{cursor:pointer}.link-OnlineFriendCount:hover{color:var(--interactive-text-hover)}";
const styles = {
    item: "item-OnlineFriendCount",
    link: "link-OnlineFriendCount"
};

const listStyles = byKeys(["listItem", "iconBadge"]);
const Item = ({ children, className, link }) => (React.createElement("div", { className: listStyles.listItem }, link ? (React.createElement(Link, { to: link, className: classNames(styles.item, styles.link, className) }, children)) : (React.createElement("div", { className: classNames(styles.link, className) }, children))));
const CounterItem = ({ type, count }) => (React.createElement(Item, { link: "/channels/@me", className: classNames(styles.counter, styles[type]) },
    count,
    " ",
    counterLabels[type].label));
const useCounters = () => useStateFromStores([GuildStore, PresenceStore, RelationshipStore], () => [
    { type: "guilds" , count: GuildStore.getGuildCount() },
    { type: "friends" , count: RelationshipStore.getFriendCount() },
    {
        type: "friendsOnline" ,
        count: RelationshipStore.getFriendIDs().filter((id) => PresenceStore.getStatus(id) !== "offline" )
            .length,
    },
    { type: "pending" , count: RelationshipStore.getPendingCount() },
    { type: "blocked" , count: RelationshipStore.getBlockedIDs().length },
]);
const CountersContainer = () => {
    const { interval, ...settings } = Settings.useCurrent();
    const counters = useCounters().filter(({ type }) => settings[type]);
    const [current, setCurrent] = React.useState(0);
    const next = React.useRef((current + 1) % counters.length);
    React.useEffect(() => {
        next.current = (current + 1) % counters.length;
    }, [current, counters.length]);
    React.useEffect(() => {
        if (interval && counters.length > 1) {
            setCurrent(0);
            const id = setInterval(() => setCurrent(next.current), 5000);
            return () => clearInterval(id);
        }
    }, [interval, counters.length]);
    return (React.createElement("div", { className: styles.container, onContextMenu: (event) => BdApi.ContextMenu.open(event, CountContextMenu) }, counters.length > 0 ? (interval ? (React.createElement(CounterItem, { ...counters[current] })) : (counters.map((counter) => React.createElement(CounterItem, { key: counter.type, ...counter })))) : (React.createElement(Item, null, "-"))));
};

const guildStyles = byKeys(["guilds", "base"]);
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
const index = createPlugin({
    start() {
        after(GuildsNav, "type", ({ result }) => {
            const guildsParent = queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
            if (!guildsParent) {
                return error("Unable to find guilds parent");
            }
            hookFunctionComponent(guildsParent, (result) => {
                const themeParent = queryTree(result, (node) => typeof node?.props?.children === "function");
                if (!themeParent) {
                    return error("Unable to find theme parent");
                }
                hookFunctionComponent(themeParent, (result) => {
                    const [scroller, index] = queryTreeForParent(result, (child) => child?.props?.lurkingGuildIds);
                    if (!scroller) {
                        return error("Unable to find home button wrapper");
                    }
                    scroller.props.children.splice(index + 1, 0, React.createElement(CountersContainer, null));
                });
            });
        }, { name: "GuildsNav" });
        triggerRerender();
    },
    stop() {
        triggerRerender();
    },
    styles: css,
    Settings,
});

module.exports = index;

/*@end @*/
