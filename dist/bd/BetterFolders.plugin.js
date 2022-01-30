/**
 * @name BetterFolders
 * @author Zerthox
 * @version 3.1.1
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

const createLogger = (name, color, version) => {
    const print = (output, ...data) => output(`%c[${name}] %c${version ? `(v${version})` : ""}`, `color: ${color}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
    return {
        print,
        log: (...data) => print(console.log, ...data),
        warn: (...data) => print(console.warn, ...data),
        error: (...data) => print(console.error, ...data)
    };
};

const join = (filters) => {
    const apply = filters.filter((filter) => filter instanceof Function);
    return (exports) => apply.every((filter) => filter(exports));
};
const generate = ({ filter, name, props, protos, source }) => [
    ...[filter].flat(),
    typeof name === "string" ? byName$1(name) : null,
    props instanceof Array ? byProps$1(props) : null,
    protos instanceof Array ? byProtos(protos) : null,
    source instanceof Array ? bySource(source) : null
];
const byName$1 = (name) => {
    return (target) => target instanceof Object && Object.values(target).some(byOwnName(name));
};
const byOwnName = (name) => {
    return (target) => target?.displayName === name || target?.constructor?.displayName === name;
};
const byProps$1 = (props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos = (protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource = (contents) => {
    return (target) => target instanceof Function && contents.every((content) => target.toString().includes(content));
};

const raw = {
    single: (filter) => BdApi.findModule(filter),
    all: (filter) => BdApi.findAllModules(filter)
};
const resolveExports = (target, filter) => {
    if (target) {
        if (typeof filter === "string") {
            return target[filter];
        }
        else if (filter instanceof Function) {
            return filter(target) ? target : Object.values(target).find((entry) => filter(entry));
        }
    }
    return target;
};
const find = (...filters) => raw.single(join(filters));
const query = (options) => resolveExports(find(...generate(options)), options.export);
const byName = (name) => resolveExports(find(byName$1(name)), byOwnName(name));
const byProps = (...props) => find(byProps$1(props));

const EventEmitter = () => byProps("subscribe", "emit");
const React$1 = () => byProps("createElement", "Component", "Fragment");
const ReactDOM$1 = () => byProps("render", "findDOMNode", "createPortal");
const classNames$1 = () => find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
const lodash$1 = () => byProps("cloneDeep", "flattenDeep");
const semver = () => byProps("valid", "satifies");
const moment = () => byProps("utc", "months");
const SimpleMarkdown = () => byProps("parseBlock", "parseInline");
const hljs = () => byProps("highlight", "highlightBlock");
const Raven = () => byProps("captureBreadcrumb");
const joi = () => byProps("assert", "validate", "object");

const npm = {
    __proto__: null,
    EventEmitter: EventEmitter,
    React: React$1,
    ReactDOM: ReactDOM$1,
    classNames: classNames$1,
    lodash: lodash$1,
    semver: semver,
    moment: moment,
    SimpleMarkdown: SimpleMarkdown,
    hljs: hljs,
    Raven: Raven,
    joi: joi
};

const Flux$1 = () => byProps("Store", "useStateFromStores");
const Events = () => byProps("dirtyDispatch");

const flux = {
    __proto__: null,
    Flux: Flux$1,
    Events: Events
};

const Constants = () => byProps("Permissions", "RelationshipTypes");
const i18n = () => byProps("languages", "getLocale");
const Channels = () => byProps("getChannel", "hasChannel");
const SelectedChannel = () => byProps("getChannelId", "getVoiceChannelId");
const Users = () => byProps("getUser", "getCurrentUser");
const Members = () => byProps("getMember", "isMember");
const ContextMenuActions = () => byProps("openContextMenuLazy");
const ModalActions = () => byProps("openModalLazy");
const Flex$2 = () => byName("Flex");
const Button$2 = () => byProps("Link", "Hovers");
const Menu = () => byProps("MenuGroup", "MenuItem", "MenuSeparator");
const Form$1 = () => byProps("FormItem", "FormSection", "FormDivider");
const margins$2 = () => byProps("marginLarge");

const discord = {
    __proto__: null,
    Constants: Constants,
    i18n: i18n,
    Channels: Channels,
    SelectedChannel: SelectedChannel,
    Users: Users,
    Members: Members,
    ContextMenuActions: ContextMenuActions,
    ModalActions: ModalActions,
    Flex: Flex$2,
    Button: Button$2,
    Menu: Menu,
    Form: Form$1,
    margins: margins$2
};

const createProxy = (entries) => {
    const result = {};
    for (const [key, value] of Object.entries(entries)) {
        Object.defineProperty(result, key, {
            enumerable: true,
            configurable: true,
            get() {
                delete this[key];
                this[key] = value();
                return this[key];
            }
        });
    }
    return result;
};
const Modules = createProxy({
    ...npm,
    ...flux,
    ...discord
});
const { React, ReactDOM, classNames, lodash, Flux } = Modules;

const resolveName = (object, method) => {
    const target = method === "default" ? object[method] : {};
    return object.displayName ?? object.constructor?.displayName ?? target.displayName ?? "unknown";
};
const createPatcher = (id, Logger) => {
    const forward = (patcher, object, method, callback, options) => {
        const original = object[method];
        const cancel = patcher(id, object, method, options.once ? (context, args, result) => {
            const temp = callback({ cancel, original, context, args, result });
            cancel();
            return temp;
        } : (context, args, result) => callback({ cancel, original, context, args, result }), { silent: true });
        if (!options.silent) {
            Logger.log(`Patched ${method} of ${options.name ?? resolveName(object, method)}`);
        }
        return cancel;
    };
    const rawPatcher = BdApi.Patcher;
    const patcher = {
        instead: (object, method, callback, options = {}) => forward(rawPatcher.instead, object, method, ({ result: _, ...data }) => callback(data), options),
        before: (object, method, callback, options = {}) => forward(rawPatcher.before, object, method, ({ result: _, ...data }) => callback(data), options),
        after: (object, method, callback, options = {}) => forward(rawPatcher.after, object, method, callback, options),
        unpatchAll: () => {
            rawPatcher.unpatchAll(id);
            Logger.log("Unpatched all");
        },
        waitForLazy: (object, method, arg, callback) => new Promise((resolve) => {
            const found = callback();
            if (found) {
                resolve(found);
            }
            else {
                Logger.log(`Waiting for lazy load in ${method} of ${resolveName(object, method)}`);
                patcher.before(object, method, ({ args, cancel }) => {
                    const original = args[arg];
                    args[arg] = async (...args) => {
                        const result = await original(...args);
                        const found = callback();
                        if (found) {
                            resolve(found);
                            cancel();
                        }
                        return result;
                    };
                }, { silent: true });
            }
        }),
        waitForContextMenu: (callback) => patcher.waitForLazy(Modules.ContextMenuActions, "openContextMenuLazy", 1, callback),
        waitForModal: (callback) => patcher.waitForLazy(Modules.ModalActions, "openModalLazy", 0, callback)
    };
    return patcher;
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
        super(new Flux.Dispatcher(), {
            update: ({ current }) => Data.save("settings", current)
        });
        this.listeners = new Map();
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
        return Flux.default.connectStores([this], () => ({ ...this.get(), defaults: this.defaults, set: (settings) => this.set(settings) }))(component);
    }
    useCurrent() {
        return Flux.useStateFromStores([this], () => this.get());
    }
    useState() {
        return Flux.useStateFromStores([this], () => [this.get(), (settings) => this.set(settings)]);
    }
    useStateWithDefaults() {
        return Flux.useStateFromStores([this], () => [this.get(), this.defaults, (settings) => this.set(settings)]);
    }
    addListener(listener) {
        const wrapper = ({ current }) => listener(current);
        this.listeners.set(listener, wrapper);
        this._dispatcher.subscribe("update", wrapper);
        return listener;
    }
    removeListener(listener) {
        const wrapper = this.listeners.get(listener);
        if (wrapper) {
            this._dispatcher.unsubscribe("update", wrapper);
            this.listeners.delete(listener);
        }
    }
    removeAllListeners() {
        for (const wrapper of this.listeners.values()) {
            this._dispatcher.unsubscribe("update", wrapper);
        }
        this.listeners.clear();
    }
}
const createSettings = (Data, defaults) => new Settings(Data, defaults);

const [getInstanceFromNode, getNodeFromInstance, getFiberCurrentPropsFromNode, enqueueStateRestore, restoreStateIfNeeded, batchedUpdates] = ReactDOM?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.Events ?? [];
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

const { Flex: Flex$1, Button: Button$1, Form, margins: margins$1 } = Modules;
const SettingsContainer = ({ name, children, onReset }) => (React.createElement(Form.FormSection, null,
    children,
    React.createElement(Form.FormDivider, { className: classNames(margins$1.marginTop20, margins$1.marginBottom20) }),
    React.createElement(Flex$1, { justify: Flex$1.Justify.END },
        React.createElement(Button$1, { size: Button$1.Sizes.SMALL, onClick: () => confirm(name, "Reset all settings?", {
                onConfirm: () => onReset()
            }) }, "Reset"))));

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
        plugin.stop();
        Logger.log("Disabled");
    };
    if (plugin.settingsPanel) {
        const ConnectedSettings = Settings.connect(plugin.settingsPanel);
        Wrapper.prototype.getSettingsPanel = () => (React.createElement(SettingsContainer, { name: name, onReset: () => Settings.reset() },
            React.createElement(ConnectedSettings, null)));
    }
    return Wrapper;
};

const { Flex, Button, margins } = Modules;
const { FormText } = Modules.Form;
const SwitchItem$1 = byName("SwitchItem");
const ImageInput = byName("ImageInput");
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
const version = "3.1.1";
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
const { FormItem } = Modules.Form;
const RadioGroup = byName("RadioGroup");
const SwitchItem = byName("SwitchItem");
const FolderHeader = query({ name: "FolderHeader" });
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
                if (Settings.get().closeOnOpen) {
                    for (const id of FolderState.getExpandedFolders()) {
                        if (id !== folderId) {
                            original(id);
                        }
                    }
                }
            });
            triggerRerender();
            const GuildFolderSettingsModal = await Patcher.waitForModal(() => byName("GuildFolderSettingsModal"));
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
