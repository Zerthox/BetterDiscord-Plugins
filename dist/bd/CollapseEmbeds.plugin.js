/**
 * @name CollapseEmbeds
 * @version 2.1.3
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
const byKeys$1 = (...keys) => {
    return (target) => target instanceof Object && keys.every((key) => key in target);
};
const byProtos$1 = (...protos) => {
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
const byKeys = (keys, options) => find(byKeys$1(...keys), options);
const byProtos = (protos, options) => find(byProtos$1(...protos), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
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
const abort = () => {
    controller.abort();
    controller = new AbortController();
};

const COLOR = "#3a71c1";
const print = (output, ...data) => output(`%c[${getMeta().name}] %c${getMeta().version ? `(v${getMeta().version})` : ""}`, `color: ${COLOR}; font-weight: 700;`, "color: #666; font-size: .8em;", ...data);
const log = (...data) => print(console.log, ...data);

const patch = (type, object, method, callback, options) => {
    const original = object?.[method];
    const name = options.name ?? String(method);
    if (!(original instanceof Function)) {
        throw TypeError(`patch target ${name} is ${original} not function`);
    }
    const cancel = BdApi.Patcher[type](getMeta().name, object, method, options.once
        ? (...args) => {
            const result = callback(cancel, original, ...args);
            cancel();
            return result;
        }
        : (...args) => callback(cancel, original, ...args));
    if (!options.silent) {
        log(`Patched ${name}`);
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

const { React } = BdApi;
const classNames = /* @__PURE__ */ find((exports$1) => exports$1 instanceof Object && exports$1.default === exports$1 && Object.keys(exports$1).length === 1);

const Button = /* @__PURE__ */ byKeys(["Colors", "Link"], { entries: true });

const Clickable = /* @__PURE__ */ bySource(["ignoreKeyPress:"], { entries: true });

const Embed = /* @__PURE__ */ byProtos(["renderSuppressButton"], { entries: true });

const Flex = /* @__PURE__ */ byKeys(["Child", "Justify", "Align"], { entries: true });

const FormItem = /* @__PURE__ */ bySource(["titleClassName:", "required:"], { entries: true });
const FormSwitch = /* @__PURE__ */ bySource(["checked:", "innerRef:", "layout:"], {
    entries: true,
});
const FormDivider = /* @__PURE__ */ bySource(["marginTop:", (source) => /{className:.,gap:.}=/.test(source)], {
    entries: true,
});
const FormText = /* @__PURE__ */ bySource(["type:", "style:", "disabled:", "DEFAULT"], {
    entries: true,
});

const IconArrow = /* @__PURE__ */ bySource(['d:"M5.3 9.'], {
    entries: true,
});

const margins = /* @__PURE__ */ byKeys(["marginBottom40", "marginTop4"]);

const MessageFooter = /* @__PURE__ */ byProtos(["renderRemoveAttachmentConfirmModal"], {
    entries: true,
});

const TextInput = /* @__PURE__ */ bySource(["placeholder", "maxLength", "clearable"], { entries: true });

const Text = /* @__PURE__ */ bySource(["lineClamp:", "variant:", "tabularNumbers:"], { entries: true });

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
const queryTreeAll = (node, predicate) => {
    const result = [];
    const worklist = [node].flat();
    while (worklist.length !== 0) {
        const node = worklist.shift();
        if (React.isValidElement(node)) {
            if (predicate(node)) {
                result.push(node);
            }
            const children = node?.props?.children;
            if (children) {
                worklist.push(...[children].flat());
            }
        }
    }
    return result;
};

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
            ? () => (React.createElement(SettingsContainer, { name: meta.name, onReset: Settings ? () => Settings.reset() : null },
                React.createElement(SettingsPanel, null)))
            : null,
    };
};

const DAYS_TO_MILLIS = 24 * 60 * 60 * 1000;
const Settings = createSettings({
    hideByDefault: false,
    saveStates: true,
    saveDuration: 30 * DAYS_TO_MILLIS,
    collapsedStates: {},
});
function getCollapsedState(id) {
    const { hideByDefault, saveStates, collapsedStates } = Settings.current;
    if (saveStates && id) {
        return collapsedStates[id]?.shown ?? !hideByDefault;
    }
    else {
        return !hideByDefault;
    }
}
function updateCollapsedState(id, shown) {
    const { saveStates, collapsedStates } = Settings.current;
    if (saveStates && id) {
        collapsedStates[id] = {
            shown,
            lastSeen: Date.now(),
        };
        Settings.update({ collapsedStates });
    }
}
function cleanupOldEntries() {
    const { saveDuration, collapsedStates } = Settings.current;
    const oldestAllowed = Date.now() - saveDuration;
    const entries = Object.entries(collapsedStates);
    let count = 0;
    for (const [id, state] of Object.entries(collapsedStates)) {
        if (state.lastSeen < oldestAllowed) {
            delete collapsedStates[id];
            count++;
        }
    }
    Settings.update({ collapsedStates });
    log(`Cleaned ${count} out of ${entries.length} entries`);
}

function SettingsPanel() {
    const [{ hideByDefault, saveStates, saveDuration }, setSettings] = Settings.useState();
    const [{ text, valid }, setDurationState] = React.useState({
        text: (saveDuration / DAYS_TO_MILLIS).toString(),
        valid: true,
    });
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: margins.marginBottom20 },
            React.createElement(FormSwitch, { description: "Collapse all embeds & attachments initially.", checked: hideByDefault, label: "Collapse by default", onChange: (checked) => setSettings({ hideByDefault: checked }) })),
        React.createElement("div", { className: margins.marginBottom20 },
            React.createElement(FormSwitch, { description: "Persist individual embed & attachment states between restarts.", checked: saveStates, label: "Save collapsed states", onChange: (checked) => setSettings({ saveStates: checked }) })),
        React.createElement(FormItem, { title: "Save duration in days", disabled: !saveStates, error: !valid ? "Duration must be a positive number of days" : null },
            React.createElement(TextInput, { type: "number", min: 0, disabled: !saveStates, value: text, onChange: (text) => {
                    const duration = Number.parseFloat(text) * DAYS_TO_MILLIS;
                    const valid = !Number.isNaN(duration) && duration >= 0;
                    if (valid) {
                        setSettings({ saveDuration: duration });
                        cleanupOldEntries();
                    }
                    setDurationState({ text, valid });
                } }),
            React.createElement(FormText, { type: "description" , disabled: !saveStates }, "How long to keep embed & attachment states after not seeing them."))));
}

const css = ".container-CollapseEmbeds.embed-CollapseEmbeds{justify-self:stretch}.container-CollapseEmbeds.embed-CollapseEmbeds>article{flex-grow:1;flex-shrink:0}.container-CollapseEmbeds.mediaItem-CollapseEmbeds.expanded-CollapseEmbeds{position:relative}.container-CollapseEmbeds.mediaItem-CollapseEmbeds.expanded-CollapseEmbeds>.hideButton-CollapseEmbeds{position:absolute;right:2px;bottom:2px;z-index:1}.placeholder-CollapseEmbeds+.placeholder-CollapseEmbeds{margin-left:4px}.hideButton-CollapseEmbeds{margin-bottom:-4px;align-self:flex-end;color:var(--interactive-normal);cursor:pointer;visibility:hidden;padding:4px;margin:-4px}.hideButton-CollapseEmbeds:hover{color:var(--interactive-hover)}.expanded-CollapseEmbeds>.hideButton-CollapseEmbeds{margin-bottom:-6px}.hideButton-CollapseEmbeds:hover,:hover+.hideButton-CollapseEmbeds,.collapsed-CollapseEmbeds>.hideButton-CollapseEmbeds{visibility:visible}.icon-CollapseEmbeds{margin:-2px;transition:transform .2s ease-out}.icon-CollapseEmbeds.open-CollapseEmbeds{transform:rotate(180deg)}";
const styles = {
    container: "container-CollapseEmbeds",
    embed: "embed-CollapseEmbeds",
    mediaItem: "mediaItem-CollapseEmbeds",
    expanded: "expanded-CollapseEmbeds",
    hideButton: "hideButton-CollapseEmbeds",
    placeholder: "placeholder-CollapseEmbeds",
    collapsed: "collapsed-CollapseEmbeds",
    icon: "icon-CollapseEmbeds",
    open: "open-CollapseEmbeds"
};

const Hider = ({ placeholders, type, children, id }) => {
    const [shown, setShown] = React.useState(() => getCollapsedState(id));
    React.useEffect(() => updateCollapsedState(id, shown), [id]);
    const toggleShown = React.useCallback(() => {
        setShown(!shown);
        updateCollapsedState(id, !shown);
    }, [id, shown]);
    return (React.createElement(Flex, { align: Flex.Align.CENTER, className: classNames(styles.container, styles[type], shown ? styles.expanded : styles.collapsed) },
        shown
            ? children
            : placeholders.filter(Boolean).map((placeholder, i) => (React.createElement(Text, { key: i, variant: "text-xs/normal", className: styles.placeholder }, placeholder))),
        React.createElement(Clickable, { className: styles.hideButton, onClick: toggleShown },
            React.createElement(IconArrow, { color: "currentColor", className: classNames(styles.icon, shown ? styles.open : null) }))));
};

const MediaModule = demangle({
    MediaItem: bySource$1("getObscureReason", "isSingleMosaicItem"),
}, null, true);
const index = createPlugin({
    start() {
        cleanupOldEntries();
        after(Embed.prototype, "render", ({ result, context }) => {
            const { embed } = context.props;
            const placeholder = embed.provider?.name
                ?? embed.author?.name
                ?? embed.rawTitle
                ?? (embed.url ? new URL(embed.url).hostname : "Embed");
            return (React.createElement(Hider, { type: "embed" , placeholders: [placeholder], id: embed.url }, result));
        }, { name: "Embed render" });
        after(MediaModule, "MediaItem", ({ args: [props], result }) => {
            const attachment = props.item.originalItem;
            const placeholder = attachment.filename ?? new URL(attachment.url).hostname;
            return (React.createElement(Hider, { type: props.isSingleMosaicItem ? "mediaItemSingle"  : "mediaItem" , placeholders: [placeholder], id: attachment.url }, result));
        }, { name: "MediaItem render" });
        after(MessageFooter.prototype, "renderAttachments", ({ result }) => {
            for (const element of queryTreeAll(result, (node) => node?.props?.attachments)) {
                hookFunctionComponent(element, (result, { attachments }) => {
                    const placeholders = attachments.map(({ attachment }) => attachment.filename ?? new URL(attachment.url).hostname);
                    const id = attachments[0]?.attachment?.url;
                    return (React.createElement(Hider, { type: "attachment" , placeholders: placeholders, id: id }, result));
                });
            }
        }, { name: "MessageFooter renderAttachments" });
    },
    stop() {
        cleanupOldEntries();
    },
    styles: css,
    Settings,
    SettingsPanel,
});

module.exports = index;

/*@end @*/
