/**
 * @name BetterFolders
 * @version 3.4.4
 * @author Zerthox
 * @authorLink https://github.com/Zerthox
 * @description Adds new functionality to server folders. Custom Folder Icons. Close other folders on open.
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/BetterFolders
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

const ClientActions = /* @__PURE__ */ byKeys(["toggleGuildFolderExpand"]);

const Flux = /* @__PURE__ */ demangle({
    default: byKeys$1("Store", "connectStores"),
    Dispatcher: byProtos("dispatch"),
    Store: byProtos("emitChange"),
    BatchedStoreListener: byProtos("attach", "detach"),
    useStateFromStores: bySource$1("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

const SortedGuildStore = /* @__PURE__ */ byName("SortedGuildStore");
const ExpandedGuildFolderStore = /* @__PURE__ */ byName("ExpandedGuildFolderStore");

const { React } = BdApi;
const { ReactDOM } = BdApi;
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Common = /* @__PURE__ */ byKeys(["Button", "Switch", "Select"]);

const Button = Common.Button;

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormLabel, FormDivider, FormSwitch, FormNotice } = Common;

const GuildsNav = /* @__PURE__ */ bySource(["guildsnav"], { entries: true });

const RadioGroup = Common.RadioGroup;

const margins = /* @__PURE__ */ byKeys(["marginLarge"]);

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

const Settings = createSettings({
    closeOnOpen: false,
    folders: {}
});

const css = ".customIcon-BetterFolders {\n  width: 100%;\n  height: 100%;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n}";
const styles = {
    customIcon: "customIcon-BetterFolders"
};

const BetterFolderIcon = ({ data, childProps, FolderIcon }) => {
    if (FolderIcon) {
        const result = FolderIcon(childProps);
        if (data?.icon && (childProps.expanded || data.always)) {
            result.props.children = React.createElement("div", { className: styles.customIcon, style: { backgroundImage: `url(${data.icon})` } });
        }
        return result;
    }
    else {
        return null;
    }
};
const compareFolderData = (a, b) => a?.icon === b?.icon && a?.always === b?.always;
const ConnectedBetterFolderIcon = ({ folderId, ...props }) => {
    const data = Settings.useSelector((current) => current.folders[folderId], [folderId], compareFolderData);
    return React.createElement(BetterFolderIcon, { data: data, ...props });
};

const ImageInput = find((target) => typeof target.defaultProps?.multiple === "boolean" && typeof target.defaultProps?.maxFileSizeBytes === "number");
const BetterFolderUploader = ({ icon, always, folderNode, onChange, FolderIcon }) => (React.createElement(React.Fragment, null,
    React.createElement(Flex, { align: Flex.Align.CENTER },
        React.createElement(Button, { color: Button.Colors.WHITE, look: Button.Looks.OUTLINED },
            "Upload Image",
            React.createElement(ImageInput, { onChange: (img) => onChange({ icon: img, always }) })),
        React.createElement(FormText, { type: "description", style: { margin: "0 10px 0 40px" } }, "Preview:"),
        React.createElement(BetterFolderIcon, { data: { icon, always: true }, childProps: { expanded: false, folderNode }, FolderIcon: FolderIcon })),
    React.createElement(FormSwitch, { hideBorder: true, className: margins.marginTop8, value: always, onChange: (checked) => onChange({ icon, always: checked }) }, "Always display icon")));

const folderModalPatch = ({ context, result }, FolderIcon) => {
    const { folderId } = context.props;
    const { state } = context;
    const form = queryTree(result, (node) => node?.type === "form");
    if (!form) {
        warn("Unable to find form");
        return;
    }
    if (!state.iconType) {
        const { icon = null, always = false } = Settings.current.folders[folderId] ?? {};
        Object.assign(state, {
            iconType: icon ? "custom"  : "default" ,
            icon,
            always
        });
    }
    const { children } = form.props;
    const { className } = children[0].props;
    children.push(React.createElement(FormItem, { title: "Icon", className: className },
        React.createElement(RadioGroup, { value: state.iconType, options: [
                { value: "default" , name: "Default Icon" },
                { value: "custom" , name: "Custom Icon" }
            ], onChange: ({ value }) => context.setState({ iconType: value }) })));
    if (state.iconType === "custom" ) {
        const tree = SortedGuildStore.getGuildsTree();
        children.push(React.createElement(FormItem, { title: "Custom Icon", className: className },
            React.createElement(BetterFolderUploader, { icon: state.icon, always: state.always, folderNode: tree.nodes[folderId], onChange: ({ icon, always }) => context.setState({ icon, always }), FolderIcon: FolderIcon })));
    }
    const button = queryTree(result, (node) => node?.props?.type === "submit");
    const original = button.props.onClick;
    button.props.onClick = (...args) => {
        original(...args);
        const { folders } = Settings.current;
        if (state.iconType === "custom"  && state.icon) {
            folders[folderId] = { icon: state.icon, always: state.always };
            Settings.update({ folders });
        }
        else if ((state.iconType === "default"  || !state.icon) && folders[folderId]) {
            delete folders[folderId];
            Settings.update({ folders });
        }
    };
};

const guildStyles = byKeys(["guilds", "base"]);
const getGuildsOwner = () => findOwner(getFiber(document.getElementsByClassName(guildStyles.guilds)?.[0]));
const triggerRerender = async (guildsFiber) => {
    if (await forceFullRerender(guildsFiber)) {
        log("Rerendered guilds");
    }
    else {
        warn("Unable to rerender guilds");
    }
};
const index = createPlugin({
    start() {
        let foundItem = false;
        let FolderIcon = null;
        const guildsOwner = getGuildsOwner();
        after(GuildsNav, "type", ({ result, cancel }) => {
            const target = queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
            if (!target) {
                return error("Unable to find chain patch target");
            }
            hookFunctionComponent(target, (result) => {
                if (foundItem) {
                    return;
                }
                const guildItem = queryTree(result, (node) => node?.props?.folderNode);
                if (!guildItem) {
                    return error("Unable to find guild item component");
                }
                foundItem = true;
                cancel();
                log("Unpatched GuildsNav");
                after(guildItem.type, "type", ({ args: [props], result }) => {
                    if (!props.folderNode) {
                        return;
                    }
                    hookFunctionComponent(result, (result, props) => {
                        const iconContainer = queryTree(result, (node) => "folderIconContent" in (node?.props ?? {}));
                        if (!iconContainer) {
                            return error("Unable to find folder icon container component");
                        }
                        hookFunctionComponent(iconContainer, (result) => {
                            const iconParent = queryTree(result, (node) => node?.props?.children?.props?.folderNode);
                            if (!iconParent) {
                                return error("Unable to find folder icon component");
                            }
                            const icon = iconParent.props.children;
                            if (!FolderIcon) {
                                FolderIcon = icon.type;
                            }
                            iconParent.props.children = React.createElement(ConnectedBetterFolderIcon, { folderId: props.folderNode.id, childProps: icon.props, FolderIcon: FolderIcon });
                        });
                    });
                }, { name: "GuildItem" });
                triggerRerender(guildsOwner);
            });
        }, { name: "GuildsNav" });
        after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
            if (Settings.current.closeOnOpen) {
                for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                    if (id !== folderId) {
                        original(id);
                    }
                }
            }
        });
        triggerRerender(guildsOwner);
        waitFor(bySource$1("GUILD_FOLDER_NAME"), { entries: true }).then((FolderSettingsModal) => {
            if (FolderSettingsModal) {
                after(FolderSettingsModal.prototype, "render", (data) => folderModalPatch(data, FolderIcon), { name: "GuildFolderSettingsModal" });
            }
        });
    },
    stop() {
        triggerRerender(getGuildsOwner());
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{ closeOnOpen }, setSettings] = Settings.useState();
        return (React.createElement(FormSwitch, { note: "Close other folders when opening a new folder", hideBorder: true, value: closeOnOpen, onChange: (checked) => {
                if (checked) {
                    for (const id of Array.from(ExpandedGuildFolderStore.getExpandedFolders()).slice(1)) {
                        ClientActions.toggleGuildFolderExpand(id);
                    }
                }
                setSettings({ closeOnOpen: checked });
            } }, "Close on open"));
    }
});

module.exports = index;

/*@end @*/
