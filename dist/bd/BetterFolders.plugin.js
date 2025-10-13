/**
 * @name BetterFolders
 * @version 3.7.1
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
const byEntry = (filter, every = false) => {
    return ((target, ...args) => {
        if (checkObjectValues(target)) {
            const values = Object.values(target);
            return values.length > 0 && values[every ? "every" : "some"]((value) => filter(value, ...args));
        }
        else {
            return false;
        }
    });
};
const byName$1 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byKeys$1 = (...keys) => {
    return (target) => target instanceof Object && keys.every((key) => key in target);
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
const resolveKey = (target, filter) => [
    target,
    Object.entries(target ?? {}).find(([, value]) => filter(value))?.[0],
];
const findWithKey = (filter) => resolveKey(find(byEntry(filter)), filter);
const demangle = (mapping, required, proxy = false) => {
    const req = Object.keys(mapping);
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
const waitFor = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.waitForModule(filter, {
    signal: controller.signal,
    defaultExport: resolve,
    searchExports: entries,
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
    const cancel = BdApi.Patcher[type](getMeta().name, object, method, options.once
        ? (...args) => {
            const result = callback(cancel, original, ...args);
            cancel();
            return result;
        }
        : (...args) => callback(cancel, original, ...args));
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

const SortedGuildStore = /* @__PURE__ */ byName("SortedGuildStore");
const ExpandedGuildFolderStore =
/* @__PURE__ */ byName("ExpandedGuildFolderStore");

const { React } = BdApi;

const Button = /* @__PURE__ */ byKeys(["Colors", "Link"], { entries: true });

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify", "Align"], { entries: true });

const FormItem = /* @__PURE__ */ bySource(["titleClassName:", "required:"], { entries: true });
const FormSwitch = /* @__PURE__ */ bySource(["onChange:", "innerRef:", '"checkbox"'], {
    entries: true,
});
const FormDivider = /* @__PURE__ */ bySource([".divider", (source) => /{className:.,gap:.}=/.test(source)], {
    entries: true,
});
const FormText = /* @__PURE__ */ bySource(["type:", "style:", "disabled:", "DEFAULT"], {
    entries: true,
});

const margins = /* @__PURE__ */ byKeys(["marginBottom40", "marginTop4"]);

const { RadioGroup} = /* @__PURE__ */ demangle({
    RadioGroup: bySource$1((source) => /{label:.,description:.,required:./.test(source)),
    getRadioAttributes: bySource$1(`role:"radio"`),
});

const TextInput = /* @__PURE__ */ bySource(["placeholder", "maxLength", "clearable"], { entries: true });
const ImageInput = /* @__PURE__ */ find((target) => typeof target.defaultProps?.multiple === "boolean" && typeof target.defaultProps?.maxFileSizeBytes === "number");

const replaceElement = (target, replace) => {
    target.type = replace.type;
    target.key = replace.key ?? target.key;
    target.props = replace.props;
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
    constructor(defaults, onLoad) {
        this.listeners = new Set();
        this.getCurrent = () => this.current;
        this.update = (settings) => {
            const update = typeof settings === "function" ? settings(this.current) : settings;
            this.current = { ...this.current, ...update };
            this._dispatch(true);
        };
        this.addListenerEffect = (listener) => {
            this.addListener(listener);
            return () => this.removeListener(listener);
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
        this.current = { ...this.current };
        for (const key of keys) {
            delete this.current[key];
        }
        this._dispatch(true);
    }
    useCurrent() {
        return React.useSyncExternalStore(this.addListenerEffect, this.getCurrent);
    }
    useSelector(selector, deps = null, compare = Object.is) {
        const state = React.useRef(null);
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
            ? () => (React.createElement(SettingsContainer, { name: meta.name, onReset: Settings ? () => Settings.reset() : null },
                React.createElement(SettingsPanel, null)))
            : null,
    };
};

const Settings = createSettings({
    closeOnOpen: false,
    folders: {},
});

const css = ".customIcon-BetterFolders {\n  box-sizing: border-box;\n  border-radius: var(--radius-lg);\n  width: var(--guildbar-folder-size);\n  height: var(--guildbar-folder-size);\n  padding: var(--custom-folder-preview-padding);\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n}";
const styles = {
    customIcon: "customIcon-BetterFolders"
};

const folderStyles = byKeys(["folderIcon", "folderIconWrapper", "folderPreviewWrapper"]);
const renderIcon = (data) => (React.createElement("div", { className: styles.customIcon, style: { backgroundImage: data?.icon ? `url(${data.icon})` : null } }));
const BetterFolderIcon = ({ data, childProps, FolderIcon }) => {
    if (FolderIcon) {
        const result = FolderIcon(childProps);
        if (data?.icon) {
            const replace = renderIcon(data);
            const iconWrapper = queryTree(result, (node) => node?.props?.className === folderStyles.folderIconWrapper);
            if (iconWrapper) {
                replaceElement(iconWrapper, replace);
            }
            else {
                error("Failed to find folderIconWrapper element");
            }
            if (data.always) {
                const previewWrapper = queryTree(result, (node) => node?.props?.className === folderStyles.folderPreviewWrapper);
                if (previewWrapper) {
                    replaceElement(previewWrapper, replace);
                }
                else {
                    error("Failed to find folderPreviewWrapper element");
                }
            }
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

const BetterFolderUploader = ({ icon, always, onChange }) => (React.createElement(React.Fragment, null,
    React.createElement(Flex, { align: Flex.Align.CENTER },
        React.createElement(Button, { color: Button.Colors.WHITE, look: Button.Looks.OUTLINED },
            "Upload Image",
            React.createElement(ImageInput, { onChange: (img) => onChange({ icon: img, always }) })),
        React.createElement(FormText, { type: "description", style: { margin: "0 10px 0 40px" } }, "Preview:"),
        renderIcon({ icon})),
    React.createElement(FormSwitch, { className: margins.marginTop8, checked: always, onChange: (checked) => onChange({ icon, always: checked }) }, "Always display icon")));

const folderModalPatch = ({ context, result, }) => {
    const { folderId } = context.props;
    const { state } = context;
    const [parent] = queryTreeForParent(result, (node) => node?.type === TextInput);
    if (!parent) {
        warn("Unable to find text input parent");
        return;
    }
    if (!state.iconType) {
        const { icon = null, always = false } = Settings.current.folders[folderId] ?? {};
        Object.assign(state, {
            iconType: icon ? "custom"  : "default" ,
            icon,
            always,
        });
    }
    const { children } = parent.props;
    children.push(React.createElement(FormItem, { title: "Icon" },
        React.createElement(RadioGroup, { value: state.iconType, options: [
                { value: "default" , name: "Default Icon" },
                { value: "custom" , name: "Custom Icon" },
            ], onChange: ({ value }) => context.setState({ iconType: value }) })));
    if (state.iconType === "custom" ) {
        const tree = SortedGuildStore.getGuildsTree();
        children.push(React.createElement(FormItem, { title: "Custom Icon" },
            React.createElement(BetterFolderUploader, { icon: state.icon, always: state.always, folderNode: tree.nodes[folderId], onChange: ({ icon, always }) => context.setState({ icon, always }) })));
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
        let FolderIcon = null;
        const guildsOwner = getGuildsOwner();
        const FolderIconWrapper = findWithKey(bySource$1("folderIconWrapper"));
        after(...FolderIconWrapper, ({ args: [props], result }) => {
            const icon = queryTree(result, (node) => node?.props?.folderNode);
            if (!icon) {
                return error("Unable to find FolderIcon component");
            }
            if (!FolderIcon) {
                log("Found FolderIcon component");
                FolderIcon = icon.type;
            }
            const replace = (React.createElement(ConnectedBetterFolderIcon, { folderId: props.folderNode.id, childProps: icon.props, FolderIcon: FolderIcon }));
            replaceElement(icon, replace);
        }, { name: "FolderIconWrapper" });
        triggerRerender(guildsOwner);
        after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
            if (Settings.current.closeOnOpen) {
                for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                    if (id !== folderId) {
                        original(id);
                    }
                }
            }
        });
        waitFor(bySource$1(".folderName", ".onClose"), { entries: true }).then((FolderSettingsModal) => {
            if (FolderSettingsModal) {
                after(FolderSettingsModal.prototype, "render", folderModalPatch, {
                    name: "GuildFolderSettingsModal",
                });
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
        return (React.createElement(FormSwitch, { description: "Close other folders when opening a new folder", checked: closeOnOpen, onChange: (checked) => {
                if (checked) {
                    for (const id of Array.from(ExpandedGuildFolderStore.getExpandedFolders()).slice(1)) {
                        ClientActions.toggleGuildFolderExpand(id);
                    }
                }
                setSettings({ closeOnOpen: checked });
            } }, "Close on open"));
    },
});

module.exports = index;

/*@end @*/
