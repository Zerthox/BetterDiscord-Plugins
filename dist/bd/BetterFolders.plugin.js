/**
 * @name BetterFolders
 * @author Zerthox
 * @version 3.1.4
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
    load: (key) => BdApi.loadData(id, key) ?? null,
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});

const byName = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byAnyName$1 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byName(name));
};
const byProps$1 = (props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};

const resolveExport = (target, filter) => {
    if (target && typeof filter === "function") {
        return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
    }
    return target;
};
const find = (filter, resolve = true) => BdApi.Webpack.getModule(filter, { defaultExport: resolve });
const byAnyName = (name, resolve = true) => resolveExport(find(byAnyName$1(name)), resolve ? byName(name) : null);
const byProps = (...props) => find(byProps$1(props));

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

const React = /* @__PURE__ */ byProps("createElement", "Component", "Fragment");
const ReactDOM = /* @__PURE__ */ byProps("render", "findDOMNode", "createPortal");
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Flux = /* @__PURE__ */ byProps("Store", "useStateFromStores");

const ClientActions = /* @__PURE__ */ byProps("toggleGuildFolderExpand");

const Flex = /* @__PURE__ */ byAnyName("Flex");
const Button = /* @__PURE__ */ byProps("Link", "Hovers");
const SwitchItem = /* @__PURE__ */ byAnyName("SwitchItem");
const RadioGroup = /* @__PURE__ */ byAnyName("RadioGroup");
const Form = /* @__PURE__ */ byProps("FormItem", "FormSection", "FormDivider");
const margins = /* @__PURE__ */ byProps("marginLarge");

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
                BdApi.injectCSS(id, styles);
            }
        },
        clear: () => BdApi.clearCSS(id)
    };
};

const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);

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
const findOwner = (fiber) => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up" , 50);
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

const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins.marginTop20, margins.marginBottom20) }),
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

const { FormText } = Form;
const ImageInput = byAnyName("ImageInput");
const BetterFolderIcon = ({ icon, always, childProps, FolderIcon }) => {
    const result = FolderIcon(childProps);
    if (icon && (childProps.expanded || always)) {
        result.props.children = React.createElement("div", { className: "betterFolders-customIcon", style: { backgroundImage: `url(${icon})` } });
    }
    return result;
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

const SortedGuildStore = byProps("getGuildsTree");
const ExpandedGuildFolderStore = byProps("getExpandedFolders");
const { FormItem } = Form;
const FolderHeader = byAnyName("FolderHeader", false);
let FolderIcon = null;
const guildStyles = byProps("guilds", "base");
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
    const triggerRerender = async () => {
        const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
        const fiber = getFiber(node);
        if (await forceFullRerender(fiber)) {
            Logger.log("Rerendered guilds");
        }
        else {
            Logger.warn("Unable to rerender guilds");
        }
    };
    return {
        async start() {
            Patcher.after(FolderHeader, "default", ({ args: [props], result }) => {
                const iconContainer = queryTree(result, (node) => node?.props?.children?.type?.displayName === "FolderIconContent");
                if (!iconContainer) {
                    Logger.warn("Unable to find folder icon container");
                    return;
                }
                const icon = iconContainer.props.children;
                if (!FolderIcon) {
                    FolderIcon = icon.type;
                }
                iconContainer.props.children = React.createElement(ConnectedBetterFolderIcon, { folderId: props.folderNode.id, childProps: icon.props, FolderIcon: FolderIcon });
            });
            Patcher.after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
                if (Settings.current.closeOnOpen) {
                    for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                        if (id !== folderId) {
                            original(id);
                        }
                    }
                }
            });
            triggerRerender();
            const GuildFolderSettingsModal = await Lazy.waitFor(byName("GuildFolderSettingsModal"));
            Patcher.after(GuildFolderSettingsModal.prototype, "render", ({ context, result }) => {
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
                        iconType: icon ? "custom" : "default",
                        icon,
                        always
                    });
                }
                const { children } = form.props;
                const { className } = children[0].props;
                children.push(React.createElement(FormItem, { title: "Icon", className: className },
                    React.createElement(RadioGroup, { value: state.iconType, options: [
                            { value: "default", name: "Default Icon" },
                            { value: "custom", name: "Custom Icon" }
                        ], onChange: ({ value }) => context.setState({ iconType: value }) })));
                if (state.iconType === "custom") {
                    const tree = SortedGuildStore.getGuildsTree();
                    children.push(React.createElement(FormItem, { title: "Custom Icon", className: className },
                        React.createElement(BetterFolderUploader, { icon: state.icon, always: state.always, folderNode: tree.nodes[folderId], onChange: ({ icon, always }) => context.setState({ icon, always }), FolderIcon: FolderIcon })));
                }
                const button = queryTree(result, (node) => node?.props?.type === "submit");
                const original = button.props.onClick;
                button.props.onClick = (...args) => {
                    original(...args);
                    const { folders } = Settings.current;
                    if (state.iconType === "custom" && state.icon) {
                        folders[folderId] = { icon: state.icon, always: state.always };
                        Settings.update({ folders });
                    }
                    else if ((state.iconType === "default" || !state.icon) && folders[folderId]) {
                        delete folders[folderId];
                        Settings.update({ folders });
                    }
                };
            });
        },
        stop() {
            triggerRerender();
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
