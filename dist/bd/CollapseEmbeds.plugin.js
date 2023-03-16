/**
 * @name CollapseEmbeds
 * @version 1.0.0
 * @author Zerthox
 * @authorLink https://github.com/Zerthox
 * @description Adds a button to collapse embeds & attachments.
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/CollapseEmbeds
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

const byName = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byKeys$1 = (...keys) => {
    return (target) => target instanceof Object && keys.every((key) => key in target);
};
const byProtos$1 = (...protos) => {
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
const byKeys = (keys, options) => find(byKeys$1(...keys), options);
const byProtos = (protos, options) => find(byProtos$1(...protos), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
const demangle = (mapping, required, proxy = false) => {
    const req = required ?? Object.keys(mapping);
    const found = find((target) => (target instanceof Object
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
let controller = new AbortController();
const abort = () => {
    controller.abort();
    controller = new AbortController();
};

const COLOR = "#3a71c1";
const print = (output, ...data) => output(`%c[${getMeta().name}] %c${getMeta().version ? `(v${getMeta().version})` : ""}`, `color: ${COLOR}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
const log = (...data) => print(console.log, ...data);

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

const Flux = /* @__PURE__ */ demangle({
    default: byKeys$1("Store", "connectStores"),
    Dispatcher: byProtos$1("dispatch"),
    Store: byProtos$1("emitChange"),
    BatchedStoreListener: byProtos$1("attach", "detach"),
    useStateFromStores: bySource$1("useStateFromStores")
}, ["Store", "Dispatcher", "useStateFromStores"]);

const { React } = BdApi;
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Button = /* @__PURE__ */ byKeys(["Colors", "Link"], { entries: true });

const Clickable = /* @__PURE__ */ bySource([".ignoreKeyPress"], { entries: true });

const Embed = /* @__PURE__ */ byProtos(["renderSuppressButton"], { entries: true });

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$1(".titleClassName", ".sectionTitle"),
    FormItem: bySource$1(".titleClassName", ".required"),
    FormTitle: bySource$1(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$1(".divider", ".style"),
    FormNotice: bySource$1(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormDivider"]);

const MessageFooter = /* @__PURE__ */ byProtos(["renderRemoveAttachmentConfirmModal"], { entries: true });

const { SwitchItem, Switch } = /* @__PURE__ */ demangle({
    SwitchItem: bySource$1(".tooltipNote"),
    Switch: byName("withDefaultColorContext()")
});

const Text = /* @__PURE__ */ bySource([".lineClamp", ".variant"], { entries: true });

const margins = /* @__PURE__ */ byKeys(["marginLarge"]);

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
    hideByDefault: false
});

const css = ".container-CollapseEmbeds.embed-CollapseEmbeds {\n  justify-self: stretch;\n}\n.container-CollapseEmbeds.embed-CollapseEmbeds > article {\n  flex-grow: 1;\n  flex-shrink: 0;\n}\n\n.placeholder-CollapseEmbeds + .placeholder-CollapseEmbeds {\n  margin-left: 4px;\n}\n\n.hideButton-CollapseEmbeds {\n  margin-bottom: -4px;\n  align-self: flex-end;\n  color: var(--interactive-normal);\n  cursor: pointer;\n  visibility: hidden;\n}\n.hideButton-CollapseEmbeds:hover {\n  color: var(--interactive-hover);\n}\n.expanded-CollapseEmbeds > .hideButton-CollapseEmbeds {\n  margin-bottom: -6px;\n}\n.hideButton-CollapseEmbeds:hover, :hover + .hideButton-CollapseEmbeds, .collapsed-CollapseEmbeds > .hideButton-CollapseEmbeds {\n  visibility: visible;\n}\n\n.icon-CollapseEmbeds {\n  margin: -2px;\n}";
const styles = {
    container: "container-CollapseEmbeds",
    embed: "embed-CollapseEmbeds",
    placeholder: "placeholder-CollapseEmbeds",
    hideButton: "hideButton-CollapseEmbeds",
    expanded: "expanded-CollapseEmbeds",
    collapsed: "collapsed-CollapseEmbeds",
    icon: "icon-CollapseEmbeds",
    attachment: "attachment-CollapseEmbeds"
};

const Arrow = bySource(["d:\"M16.", (source) => /\.open[,;]/.test(source)]);
const Hider = ({ placeholders, type, children }) => {
    const [shown, setShown] = React.useState(!Settings.current.hideByDefault);
    Settings.useListener(({ hideByDefault }) => setShown(!hideByDefault), []);
    return (React.createElement(Flex, { align: Flex.Align.CENTER, className: classNames(styles.container, styles[type], shown ? styles.expanded : styles.collapsed) },
        shown ? children : placeholders.filter(Boolean).map((placeholder, i) => (React.createElement(Text, { key: i, variant: "text-xs/normal", className: styles.placeholder }, placeholder))),
        React.createElement(Clickable, { className: styles.hideButton, onClick: () => setShown(!shown) },
            React.createElement(Arrow, { open: shown, className: styles.icon }))));
};

const index = createPlugin({
    start() {
        after(Embed.prototype, "render", ({ result, context }) => {
            const { embed } = context.props;
            const placeholder = embed.provider?.name ?? embed.author?.name ?? embed.rawTitle ?? new URL(embed.url).hostname;
            return (React.createElement(Hider, { type: "embed" , placeholders: [placeholder] }, result));
        }, { name: "Embed render" });
        after(MessageFooter.prototype, "renderAttachments", ({ result }) => {
            for (const element of queryTreeAll(result, (node) => node?.props?.attachments)) {
                hookFunctionComponent(element, (result, { attachments }) => {
                    return (React.createElement(Hider, { type: "attachment" , placeholders: attachments.map(({ attachment }) => attachment.filename ?? new URL(attachment.url).hostname) }, result));
                });
            }
        }, { name: "MessageFooter renderAttachments" });
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{ hideByDefault }, setSettings] = Settings.useState();
        return (React.createElement(SwitchItem, { note: "Collapse all embeds & attachments initially.", hideBorder: true, value: hideByDefault, onChange: (checked) => setSettings({ hideByDefault: checked }) }, "Collapse by default"));
    }
});

module.exports = index;

/*@end @*/
