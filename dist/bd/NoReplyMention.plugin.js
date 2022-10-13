/**
 * @name NoReplyMention
 * @author Zerthox
 * @version 0.1.0
 * @description Suppresses reply mentions.
 * @authorLink https://github.com/Zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/src/NoReplyMention
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
    return {
        instead: (object, method, callback, options = {}) => forward(BdApi.Patcher, "instead", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        before: (object, method, callback, options = {}) => forward(BdApi.Patcher, "before", object, method, (cancel, original, context, args) => callback({ cancel, original, context, args }), options),
        after: (object, method, callback, options = {}) => forward(BdApi.Patcher, "after", object, method, (cancel, original, context, args, result) => callback({ cancel, original, context, args, result }), options),
        unpatchAll: () => {
            if (BdApi.Patcher.getPatchesByCaller(id).length > 0) {
                BdApi.Patcher.unpatchAll(id);
                Logger.log("Unpatched all");
            }
        }
    };
};

const byEntry = (filter) => {
    return (target, ...args) => target instanceof Object && target !== window && Object.values(target).some((value) => filter(value, ...args));
};
const byProps$1 = (...props) => {
    return (target) => target instanceof Object && props.every((prop) => prop in target);
};
const byProtos$1 = (...protos) => {
    return (target) => target instanceof Object && target.prototype instanceof Object && protos.every((proto) => proto in target.prototype);
};
const bySource$1 = (...fragments) => {
    return (target) => {
        if (target instanceof Function) {
            const source = target.toString();
            const renderSource = target.prototype?.render?.toString();
            return fragments.every((fragment) => (typeof fragment === "string" ? (source.includes(fragment) || renderSource?.includes(fragment)) : (fragment(source) || renderSource && fragment(renderSource))));
        }
        else {
            return false;
        }
    };
};

const find = (filter, { resolve = true, entries = false } = {}) => BdApi.Webpack.getModule(filter, {
    defaultExport: resolve,
    searchExports: entries
});
const byProps = (props, options) => find(byProps$1(...props), options);
const byProtos = (protos, options) => find(byProtos$1(...protos), options);
const bySource = (contents, options) => find(bySource$1(...contents), options);
const demangle = (mapping, required, resolve = true) => {
    const req = required ?? Object.keys(mapping);
    const found = find((exports) => (exports instanceof Object
        && exports !== window
        && req.every((req) => {
            const filter = mapping[req];
            return typeof filter === "string"
                ? filter in exports
                : Object.values(exports).some((value) => filter(value));
        })));
    return resolve ? Object.fromEntries(Object.entries(mapping).map(([key, filter]) => [
        key,
        typeof filter === "string" ? found?.[filter] : Object.values(found ?? {}).find((value) => filter(value))
    ])) : found;
};

const OldFlux = /* @__PURE__ */ byProps(["Store"]);
const Flux = {
    default: OldFlux,
    Store: OldFlux?.Store,
    Dispatcher: /* @__PURE__ */ byProtos(["dispatch", "unsubscribe"], { entries: true }),
    useStateFromStores: /* @__PURE__ */ bySource(["useStateFromStores"], { entries: true })
};

const { React } = BdApi;
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

const Flex = /* @__PURE__ */ byProps(["Child", "Justify"], { entries: true });

const Button = /* @__PURE__ */ byProps(["Colors", "Link"], { entries: true });

const { FormSection, FormItem, FormTitle, FormText, FormDivider, FormNotice } = /* @__PURE__ */ demangle({
    FormSection: bySource$1(".titleClassName", ".sectionTitle"),
    FormItem: bySource$1(".titleClassName", ".required"),
    FormTitle: bySource$1(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: bySource$1(".divider", ".style", "\"div\""),
    FormNotice: bySource$1(".imageData", "formNotice")
}, ["FormSection", "FormItem", "FormText"]);

const margins = /* @__PURE__ */ byProps(["marginLarge"]);

const confirm = (title, content, options = {}) => BdApi.UI.showConfirmationModal(title, content, options);

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

const filter = bySource$1(".shouldMention");
const ReplyActions = find(byEntry(filter));
const [key] = Object.entries(ReplyActions).find(([, value]) => filter(value));
const index = createPlugin({}, ({ Patcher }) => ({
    start() {
        Patcher.before(ReplyActions, key, ({ args: [options] }) => {
            options.shouldMention = false;
        }, { name: "createPendingReply" });
    },
    stop() { }
}));

module.exports = index;

/*@end @*/
