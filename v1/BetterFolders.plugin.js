/**
 * @name BetterFolders
 * @author Zerthox
 * @version 3.0.2
 * @description Add new functionality to server folders. Custom Folder Icons. Close other folders on open.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/BetterFolders
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/dist/bd/BetterFolders.plugin.js
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

let webpackRequire;
global.webpackJsonp.push([
    [],
    {
        __discordium__: (_module, _exports, require) => {
            webpackRequire = require;
        }
    },
    [["__discordium__"]]
]);
delete webpackRequire.m.__discordium__;
delete webpackRequire.c.__discordium__;
const joinFilters = (filters) => {
    return (module) => {
        const { exports } = module;
        return filters.every((filter) => filter(exports, module) || (exports?.__esModule && filter(exports?.default, module)));
    };
};
const filters = {
    byExports(exported) {
        return (target) => target === exported || (target instanceof Object && Object.values(target).includes(exported));
    },
    byName(name) {
        return (target) => target instanceof Object && Object.values(target).some(filters.byDisplayName(name));
    },
    byDisplayName(name) {
        return (target) => target?.displayName === name || target?.constructor?.displayName === name;
    },
    byProps(props) {
        return (target) => target instanceof Object && props.every((prop) => prop in target);
    },
    byProtos(protos) {
        return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
    },
    bySource(contents) {
        return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
    }
};
const genFilters = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? filters.byName(name) : null,
    props instanceof Array ? filters.byProps(props) : null,
    protos instanceof Array ? filters.byProtos(protos) : null,
    source instanceof Array ? filters.bySource(source) : null
].filter((entry) => entry instanceof Function);
const raw = {
    require: webpackRequire,
    getAll: () => Object.values(webpackRequire.c),
    getSources: () => Object.values(webpackRequire.m),
    getSource: (id) => webpackRequire.m[id] ?? null,
    find: (...filters) => raw.getAll().find(joinFilters(filters)) ?? null,
    query: (options) => raw.find(...genFilters(options)),
    byId: (id) => webpackRequire.c[id] ?? null,
    byExports: (exported) => raw.find(filters.byExports(exported)),
    byName: (name) => raw.find(filters.byName(name)),
    byProps: (...props) => raw.find(filters.byProps(props)),
    byProtos: (...protos) => raw.find(filters.byProtos(protos)),
    bySource: (...contents) => raw.find(filters.bySource(contents)),
    all: {
        find: (...filters) => raw.getAll().filter(joinFilters(filters)),
        query: (options) => raw.all.find(...genFilters(options)),
        byExports: (exported) => raw.all.find(filters.byExports(exported)),
        byName: (name) => raw.all.find(filters.byName(name)),
        byProps: (...props) => raw.all.find(filters.byProps(props)),
        byProtos: (...protos) => raw.all.find(filters.byProtos(protos)),
        bySource: (...contents) => raw.all.find(filters.bySource(contents))
    },
    resolveExports(module, filter = null) {
        if (module instanceof Object && "exports" in module) {
            const exported = module.exports;
            if (!exported) {
                return exported;
            }
            if (typeof filter === "string") {
                return exported[filter];
            }
            else if (filter instanceof Function) {
                const result = Object.values(exported).find((value) => filter(value));
                if (result !== undefined) {
                    return result;
                }
            }
            if (exported.__esModule && "default" in exported && Object.keys(exported).length === 1) {
                return exported.default;
            }
            else {
                return exported;
            }
        }
        return null;
    },
    resolveImportIds(module) {
        const source = webpackRequire.m[module.id].toString();
        const match = source.match(/^(?:function)?\s*\(\w+,\w+,(\w+)\)\s*(?:=>)?\s*{/);
        if (match) {
            const requireName = match[1];
            const calls = Array.from(source.matchAll(new RegExp(`\\W${requireName}\\((\\d+)\\)`, "g")));
            return calls.map((call) => parseInt(call[1]));
        }
        else {
            return [];
        }
    },
    resolveImports: (module) => raw.resolveImportIds(module).map((id) => raw.byId(id)),
    resolveStyles: (module) => raw.resolveImports(module).filter((imported) => (imported instanceof Object
        && "exports" in imported
        && Object.values(imported.exports).every((value) => typeof value === "string")
        && Object.entries(imported.exports).find(([key, value]) => (new RegExp(`^${key}-([a-zA-Z0-9-_]){6}(\\s.+)$`)).test(value)))),
    resolveUsers: (module) => raw.all.find((_, user) => raw.resolveImportIds(user).includes(module.id))
};
const find = (...filters) => raw.resolveExports(raw.find(...filters));
const query = (options) => raw.resolveExports(raw.query(options), options.export);
const byName = (name) => raw.resolveExports(raw.byName(name), filters.byDisplayName(name));
const byProps = (...props) => raw.resolveExports(raw.byProps(...props), filters.byProps(props));

byProps("subscribe", "emit");
const React = byProps("createElement", "Component", "Fragment");
const ReactDOM = byProps("render", "findDOMNode", "createPortal");
const classNames = find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
byProps("cloneDeep", "flattenDeep");
byProps("valid", "satifies");
byProps("utc", "months");
byProps("parseBlock", "parseInline");
byProps("highlight", "highlightBlock");
byProps("captureBreadcrumb");
byProps("assert", "validate", "object");
const Flux = query({ props: ["Store", "connectStores"], export: "default" });
const Dispatcher = query({ props: ["Dispatcher"], export: "Dispatcher" });
byProps("languages", "getLocale");

React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events;
const ReactDOMInternals = {
    getInstanceFromNode,
    getNodeFromInstance,
    getFiberCurrentPropsFromNode,
    enqueueStateRestore,
    restoreStateIfNeeded,
    batchedUpdates
};

const confirm = (title, content, options = {}) => BdApi.showConfirmationModal(title, content, options);
const queryTree = (node, predicate) => {
    if (predicate(node)) {
        return node;
    }
    if (node?.props?.children) {
        for (const child of [node.props.children].flat()) {
            const result = queryTree(child, predicate);
            if (result) {
                return result;
            }
        }
    }
    return null;
};
const getFiber = (node) => ReactDOMInternals.getInstanceFromNode(node ?? {});
const queryFiber = (fiber, predicate, direction = "up", depth = 30, current = 0) => {
    if (current > depth) {
        return null;
    }
    if (predicate(fiber)) {
        return fiber;
    }
    if ((direction === "up" || direction === "both") && fiber.return) {
        const result = queryFiber(fiber.return, predicate, "up", depth, current + 1);
        if (result) {
            return result;
        }
    }
    if ((direction === "down" || direction === "both") && fiber.child) {
        let child = fiber.child;
        while (child) {
            const result = queryFiber(child, predicate, "down", depth, current + 1);
            if (result) {
                return result;
            }
            child = child.sibling;
        }
    }
    return null;
};
const findOwner = (fiber) => {
    return queryFiber(fiber, (node) => node?.stateNode instanceof React.Component, "up", 50);
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
    const forward = (patcher, object, method, callback, options) => {
        const original = object[method];
        const cancel = patcher(id, object, method, (context, args, result) => {
            const temp = callback({ cancel, original, context, args, result });
            if (options.once) {
                cancel();
            }
            return temp;
        }, { silent: true });
        if (!options.silent) {
            const target = method === "default" ? object[method] : {};
            const name = options.name ?? object.displayName ?? object.constructor?.displayName ?? target.displayName ?? "unknown";
            Logger.log(`Patched ${method} of ${name}`);
        }
        return cancel;
    };
    const { Patcher } = BdApi;
    const instead = (object, method, callback, options = {}) => forward(Patcher.instead, object, method, ({ result: _, ...data }) => callback(data), options);
    const before = (object, method, callback, options = {}) => forward(Patcher.before, object, method, ({ result: _, ...data }) => callback(data), options);
    const after = (object, method, callback, options = {}) => forward(Patcher.after, object, method, callback, options);
    return {
        instead,
        before,
        after,
        unpatchAll: () => {
            Patcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        forceRerender: (fiber) => new Promise((resolve) => {
            const owner = findOwner(fiber);
            if (owner) {
                const { stateNode } = owner;
                after(stateNode, "render", () => null, { once: true });
                stateNode.forceUpdate(() => stateNode.forceUpdate(() => resolve(true)));
            }
            else {
                resolve(false);
            }
        })
    };
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
        super(new Dispatcher(), {
            update: ({ current }) => Data.save("settings", current)
        });
        this.listeners = new Set();
        this.defaults = defaults;
        this.current = { ...defaults, ...Data.load("settings") };
    }
    get() {
        return { ...this.current };
    }
    set(settings) {
        Object.assign(this.current, settings instanceof Function ? settings(this.get()) : settings);
        this._dispatcher.dispatch({ type: "update", current: this.current });
    }
    reset() {
        this.set({ ...this.defaults });
    }
    connect(component) {
        return Flux.connectStores([this], () => ({ ...this.get(), defaults: this.defaults, set: (settings) => this.set(settings) }))(component);
    }
    addListener(listener) {
        this.listeners.add(listener);
        this._dispatcher.subscribe("update", listener);
        return listener;
    }
    removeListener(listener) {
        if (this.listeners.has(listener)) {
            this._dispatcher.unsubscribe("update", listener);
            this.listeners.delete(listener);
        }
    }
    removeAllListeners() {
        for (const listener of this.listeners) {
            this._dispatcher.unsubscribe("update", listener);
        }
        this.listeners.clear();
    }
}
const createSettings = (Data, defaults) => new Settings(Data, defaults);

const Flex$1 = byName("Flex");
const Button$1 = byProps("Link", "Hovers");
const Form = byProps("FormItem", "FormSection", "FormDivider");
const margins$1 = byProps("marginLarge");

const createPlugin = ({ name, version, styles: css, settings }, callback) => {
    const Logger = createLogger(name, "#3a71c1", version);
    const Patcher = createPatcher(name, Logger);
    const Styles = createStyles(name);
    const Data = createData(name);
    const Settings = createSettings(Data, settings ?? {});
    const plugin = callback({ Logger, Patcher, Styles, Data, Settings });
    function Wrapper() { }
    Wrapper.prototype.start = () => {
        Logger.log("Enabled");
        Styles.inject(css);
        plugin.start();
    };
    Wrapper.prototype.stop = () => {
        Patcher.unpatchAll();
        Styles.clear();
        const promise = plugin.stop();
        if (promise) {
            promise.then(() => Logger.log("Disabled"));
        }
        else {
            Logger.log("Disabled");
        }
    };
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(Form.FormSection, null,
            React.createElement(ConnectedSettings, null),
            React.createElement(Form.FormDivider, { className: classNames(margins$1.marginTop20, margins$1.marginBottom20) }),
            React.createElement(Flex$1, { justify: Flex$1.Justify.END },
                React.createElement(Button$1, { size: Button$1.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                        onConfirm: () => Settings.reset()
                    }) }, "Reset"))));
    }
    return Wrapper;
};

const Flex = byName("Flex");
const Button = byProps("Link", "Hovers");
const SwitchItem$1 = byName("SwitchItem");
const { FormText } = byProps("FormSection", "FormText") ?? {};
const ImageInput = byName("ImageInput");
const margins = byProps("marginLarge");
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
    React.createElement(SwitchItem$1, { hideBorder: true, className: margins.marginTop8, value: always, onChange: (checked) => onChange({ icon, always: checked }) }, "Always display icon")));

const name = "BetterFolders";
const author = "Zerthox";
const version = "3.0.2";
const description = "Add new functionality to server folders. Custom Folder Icons. Close other folders on open.";
const config = {
	name: name,
	author: author,
	version: version,
	description: description
};

const styles = ".betterFolders-customIcon {\n  width: 100%;\n  height: 100%;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n}\n\n.betterFolders-preview {\n  margin: 0 10px;\n  background-size: contain;\n  background-position: center;\n  background-repeat: no-repeat;\n  border-radius: 16px;\n  cursor: default;\n}";

const ClientActions = byProps("toggleGuildFolderExpand");
const GuildsTree = byProps("getGuildsTree");
const FolderState = byProps("getExpandedFolders");
const { FormItem } = byProps("FormSection", "FormText") ?? {};
const RadioGroup = byName("RadioGroup");
const SwitchItem = byName("SwitchItem");
const FolderHeader = raw.byName("FolderHeader")?.exports;
const GuildFolderSettingsModal = byName("GuildFolderSettingsModal");
let FolderIcon = null;
const guildStyles = byProps("guilds", "base");
const settings = {
    closeOnOpen: false,
    folders: {}
};
const index = createPlugin({ ...config, styles, settings }, ({ Logger, Patcher, Data, Settings }) => {
    const oldFolders = Data.load("folders");
    if (oldFolders) {
        Data.delete("folders");
        Settings.set({ folders: oldFolders });
    }
    const getFolder = (id) => Settings.get().folders[id];
    const ConnectedBetterFolderIcon = Flux.connectStores([Settings], ({ folderId }) => ({ ...getFolder(folderId) }))(BetterFolderIcon);
    const triggerRerender = async () => {
        const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
        const fiber = getFiber(node);
        if (await Patcher.forceRerender(fiber)) {
            Logger.log("Rerendered guilds");
        }
        else {
            Logger.warn("Unable to rerender guilds");
        }
    };
    return {
        start() {
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
                    const tree = GuildsTree.getGuildsTree();
                    children.push(React.createElement(FormItem, { title: "Custom Icon", className: className },
                        React.createElement(BetterFolderUploader, { icon: state.icon, always: state.always, folderNode: tree.nodes[folderId], onChange: ({ icon, always }) => context.setState({ icon, always }), FolderIcon: FolderIcon })));
                }
                const button = queryTree(result, (node) => node?.props?.type === "submit");
                const original = button.props.onClick;
                button.props.onClick = (...args) => {
                    original(...args);
                    const { folders } = Settings.get();
                    if (state.iconType === "custom" && state.icon) {
                        folders[folderId] = { icon: state.icon, always: state.always };
                        Settings.set({ folders });
                    }
                    else if ((state.iconType === "default" || !state.icon) && folders[folderId]) {
                        delete folders[folderId];
                        Settings.set({ folders });
                    }
                };
            });
            Patcher.after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
                if (Settings.get().closeOnOpen) {
                    for (const id of FolderState.getExpandedFolders()) {
                        if (id !== folderId) {
                            original(id);
                        }
                    }
                }
            });
            triggerRerender();
        },
        stop() {
            triggerRerender();
        },
        settingsPanel: ({ closeOnOpen, set }) => (React.createElement(SwitchItem, { note: "Close other folders when opening a new folder", hideBorder: true, value: closeOnOpen, onChange: (checked) => {
                if (checked) {
                    for (const id of Array.from(FolderState.getExpandedFolders()).slice(1)) {
                        ClientActions.toggleGuildFolderExpand(id);
                    }
                }
                set({ closeOnOpen: checked });
            } }, "Close on open"))
    };
});

module.exports = index;

/*@end @*/
