/**
 * @name BetterFolders
 * @author Zerthox
 * @version 3.2.0
 * @description Add new functionality to server folders. Custom Folder Icons. Close other folders on open.
 * @authorLink https://github.com/Zerthox
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
    let menuPatches = [];
    return {
        instead: (object, method, callback, options = {}) => forward(BdApi.Patcher, "instead", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        before: (object, method, callback, options = {}) => forward(BdApi.Patcher, "before", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        after: (object, method, callback, options = {}) => forward(BdApi.Patcher, "after", object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options),
        contextMenu(navId, callback, options = {}) {
            const cancel = BdApi.ContextMenu.patch(navId, options.once ? (tree) => {
                const result = callback(tree);
                cancel();
                return result;
            } : callback);
            menuPatches.push(cancel);
            if (!options.silent) {
                Logger.log(`Patched ${options.name ?? `"${navId}"`} context menu`);
            }
            return cancel;
        },
        unpatchAll() {
            if (menuPatches.length + BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                for (const cancel of menuPatches) {
                    cancel();
                }
                menuPatches = [];
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};

const byName$1 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byProps$1 = (...props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos = (...protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource$1 = (...fragments) => {
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
const byProps = (props, options) => find(byProps$1(...props), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find((target) => (target instanceof Object
        && target !== window
        && req.every((req) => {
            const filter = mapping[req];
            return typeof filter === "string"
                ? filter in target
                : Object.values(target).some((value) => filter(value));
        })));
    return proxy ? mappedProxy(found, Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        Object.entries(found ?? {}).find(([, value]) => filter(value))?.[0]
    ]))) : Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        Object.values(found ?? {}).find((value) => filter(value))
    ]));
};

const ClientActions = /* @__PURE__ */ byProps(["toggleGuildFolderExpand"]);

const Flux = /* @__PURE__ */ demangle({
    default: byProps$1("Store", "connectStores"),
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

const Button = /* @__PURE__ */ byProps(["Colors", "Link"], { entries: true });

const Flex = /* @__PURE__ */ byProps(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$1(".titleClassName", ".sectionTitle"),
    FormItem: bySource$1(".titleClassName", ".required"),
    FormTitle: bySource$1(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$1(".divider", ".style"),
    FormNotice: bySource$1(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormDivider"]);

const GuildsNav = /* @__PURE__ */ bySource(["guildsnav"], { entries: true });

const RadioGroup = /* @__PURE__ */ bySource([".radioItemClassName", ".options"], { entries: true });

const SwitchItem = /* @__PURE__ */ bySource([".helpdeskArticleId"], { entries: true });

const margins = /* @__PURE__ */ byProps(["marginLarge"]);

const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
const ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
};

const FCHook = ({ children: { type, props }, callback, once = false }) => {
    const called = React.useRef(false);
    const result = type(props);
    if (once && called.current) {
        return result;
    }
    else {
        called.current = true;
        return callback(result, props) ?? result;
    }
};
const hookFunctionComponent = (target, callback, once) => {
    const props = {
        children: { ...target },
        callback,
        once
    };
    target.props = props;
    target.type = FCHook;
    return target;
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

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(FormSection, null,
    children,
    React.createElement(FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
    React.createElement(Flex, { justify: Flex.Justify.END },
        React.createElement(Button, { size: Button.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

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

const ImageInput = find((target) => typeof target.defaultProps?.multiple === "boolean" && typeof target.defaultProps?.maxFileSizeBytes === "number");
const BetterFolderIcon = ({ icon, always, childProps, FolderIcon }) => {
    if (FolderIcon) {
        const result = FolderIcon(childProps);
        if (icon && (childProps.expanded || always)) {
            result.props.children = React.createElement("div", { className: "betterFolders-customIcon", style: { backgroundImage: `url(${icon})` } });
        }
        return result;
    }
    else {
        return null;
    }
};
const BetterFolderUploader = ({ icon, always, folderNode, onChange, FolderIcon }) => (React.createElement(React.Fragment, null,
    React.createElement(Flex, { align: Flex.Align.CENTER },
        React.createElement(Button, { color: Button.Colors.WHITE, look: Button.Looks.OUTLINED },
            "Upload Image",
            React.createElement(ImageInput, { onChange: (img) => onChange({ icon: img, always }) })),
        React.createElement(FormText, { type: "description", style: { margin: "0 10px 0 40px" } }, "Preview:"),
        React.createElement(BetterFolderIcon, { icon: icon, always: true, childProps: { expanded: false, folderNode }, FolderIcon: FolderIcon })),
    React.createElement(SwitchItem, { hideBorder: true, className: margins.marginTop8, value: always, onChange: (checked) => onChange({ icon, always: checked }) }, "Always display icon")));

const styles = ".betterFolders-customIcon {\n  width: 100%;\n  height: 100%;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\n.betterFolders-preview {\n  margin: 0 10px;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n  border-radius: 16px;\n  cursor: default;\n}";

const guildStyles = byProps(["guilds", "base"]);
const settings = {
    closeOnOpen: false,
    folders: {}
};
const index = createPlugin({ styles, settings }, ({ Logger, Lazy, Patcher, Data, Settings }) => {
    const oldFolders = Data.load("folders");
    if (oldFolders) {
        Data.delete("folders");
        Settings.update({ folders: oldFolders });
    }
    const getFolder = (id) => Settings.current.folders[id];
    const ConnectedBetterFolderIcon = Flux.default.connectStores([Settings], ({ folderId }) => ({ ...getFolder(folderId) }))(BetterFolderIcon);
    const getGuildsOwner = () => findOwner(getFiber(document.getElementsByClassName(guildStyles.guilds)?.[0]));
    const triggerRerender = async (guildsFiber) => {
        if (await forceFullRerender(guildsFiber)) {
            Logger.log("Rerendered guilds");
        }
        else {
            Logger.warn("Unable to rerender guilds");
        }
    };
    let FolderIcon = null;
    return {
        start() {
            const guildsOwner = getGuildsOwner();
            Patcher.after(GuildsNav, "type", ({ result, cancel }) => {
                const target = queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
                if (!target) {
                    return Logger.error("Unable to find chain patch target");
                }
                hookFunctionComponent(target, (result) => {
                    const guildItem = queryTree(result, (node) => node?.props?.folderNode);
                    if (!guildItem) {
                        return Logger.error("Unable to find guild item component");
                    }
                    cancel();
                    Logger.log("Unpatched GuildsNav");
                    Patcher.after(guildItem.type, "type", ({ args: [props], result }) => {
                        if (!props.folderNode) {
                            return;
                        }
                        hookFunctionComponent(result, (result, props) => {
                            const iconContainer = queryTree(result, (node) => "folderIconContent" in (node?.props ?? {}));
                            if (!iconContainer) {
                                return Logger.error("Unable to find folder icon container component");
                            }
                            hookFunctionComponent(iconContainer, (result) => {
                                const iconParent = queryTree(result, (node) => node?.props?.children?.props?.folderNode);
                                if (!iconParent) {
                                    return Logger.error("Unable to find folder icon component");
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
                }, true);
            }, { name: "GuildsNav" });
            Patcher.after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
                if (Settings.current.closeOnOpen) {
                    for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                        if (id !== folderId) {
                            original(id);
                        }
                    }
                }
            });
            triggerRerender(guildsOwner);
            Lazy.waitFor(bySource$1("GUILD_FOLDER_NAME"), { entries: true }).then((FolderSettingsModal) => {
                if (!FolderSettingsModal) {
                    return;
                }
                Patcher.after(FolderSettingsModal.prototype, "render", ({ context, result }) => {
                    const { folderId } = context.props;
                    const { state } = context;
                    const form = queryTree(result, (node) => node?.type === "form");
                    if (!form) {
                        Logger.warn("Unable to find form");
                        return;
                    }
                    if (!state.iconType) {
                        const { icon = null, always = false } = getFolder(folderId) ?? {};
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
                }, { name: "GuildFolderSettingsModal" });
            });
        },
        stop() {
            triggerRerender(getGuildsOwner());
        },
        SettingsPanel: () => {
            const [{ closeOnOpen }, setSettings] = Settings.useState();
            return (React.createElement(SwitchItem, { note: "Close other folders when opening a new folder", hideBorder: true, value: closeOnOpen, onChange: (checked) => {
                    if (checked) {
                        for (const id of Array.from(ExpandedGuildFolderStore.getExpandedFolders()).slice(1)) {
                            ClientActions.toggleGuildFolderExpand(id);
                        }
                    }
                    setSettings({ closeOnOpen: checked });
                } }, "Close on open"));
        }
    };
});

module.exports = index;

/*@end @*/
