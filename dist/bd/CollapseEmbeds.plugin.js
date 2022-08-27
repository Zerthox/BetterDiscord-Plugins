/**
 * @name CollapseEmbeds
 * @author Zerthox
 * @version 0.1.0
 * @description Collapse embeds & attachments.
 * @authorLink https://github.com/Zerthox
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

const createData = (id) => ({
    load: (key) => BdApi.loadData(id, key) ?? null,
    save: (key, value) => BdApi.saveData(id, key, value),
    delete: (key) => BdApi.deleteData(id, key)
});

const byName$1 = (name) => {
    return (target) => (target?.displayName ?? target?.constructor?.displayName) === name;
};
const byAnyName$1 = (name) => {
    return (target) => target instanceof Object && target !== window && Object.values(target).some(byName$1(name));
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
const byName = (name, resolve = true) => find(byName$1(name), resolve);
const byAnyName = (name, resolve = true) => resolveExport(find(byAnyName$1(name)), resolve ? byName$1(name) : null);
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
const classNames = /* @__PURE__ */ find((exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

const Flux = /* @__PURE__ */ byProps("Store", "useStateFromStores");

const Flex = /* @__PURE__ */ byAnyName("Flex");
const Button = /* @__PURE__ */ byProps("Link", "Hovers");
const Text = /* @__PURE__ */ byAnyName("Text");
const Clickable = /* @__PURE__ */ byAnyName("Clickable");
const SwitchItem = /* @__PURE__ */ byAnyName("SwitchItem");
const Form = /* @__PURE__ */ byProps("FormItem", "FormSection", "FormDivider");
const margins = /* @__PURE__ */ byProps("marginLarge");

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

const styles = ".collapseEmbeds-hideButton {\n  align-self: flex-end;\n  color: var(--interactive-normal);\n  cursor: pointer;\n  visibility: hidden;\n}\n.collapseEmbeds-hideButton:hover {\n  color: var(--interactive-hover);\n}\n.collapseEmbeds-expanded > .collapseEmbeds-hideButton {\n  margin-bottom: -6px;\n}\n.collapseEmbeds-attachment.collapseEmbeds-expanded > .collapseEmbeds-hideButton {\n  margin-left: -23px;\n}\n.collapseEmbeds-container:hover > .collapseEmbeds-hideButton, .collapseEmbeds-collapsed > .collapseEmbeds-hideButton {\n  visibility: visible;\n}";

const Embed = byAnyName("Embed");
const MessageAttachment = byName("MessageAttachment", false);
const ArrowDropDown = byAnyName("ArrowDropDown");
const ArrowDropUp = byAnyName("ArrowDropUp");
const settings = {
    hideByDefault: false
};
const index = createPlugin({ styles, settings }, ({ Patcher, Settings }) => {
    const typeClasses = {
        ["embed" ]: "collapseEmbeds-embed",
        ["attachment" ]: "collapseEmbeds-attachment"
    };
    const Hider = ({ placeholder, type, children }) => {
        const { hideByDefault } = Settings.useCurrent();
        const [shown, setShown] = React.useState(!hideByDefault);
        Settings.useListener(({ hideByDefault }) => setShown(!hideByDefault));
        return (React.createElement(Flex, { align: Flex.Align.CENTER, className: classNames("collapseEmbeds-container", typeClasses[type], `collapseEmbeds-${shown ? "expanded" : "collapsed"}`) },
            React.createElement("div", { className: "collapseEmbeds-content" }, shown ? children : React.createElement(Text, { variant: "text-xs/normal" }, placeholder)),
            React.createElement(Clickable, { className: "collapseEmbeds-hideButton", onClick: () => setShown(!shown) }, shown ? React.createElement(ArrowDropUp, null) : React.createElement(ArrowDropDown, null))));
    };
    return {
        start() {
            Patcher.after(Embed.prototype, "render", ({ result, context }) => {
                const { embed } = context.props;
                return React.createElement(Hider, { type: "embed" , placeholder: embed.provider?.name }, result);
            });
            Patcher.after(MessageAttachment, "default", ({ args: [props], result }) => {
                return React.createElement(Hider, { type: "attachment" , placeholder: props.attachment.filename }, result);
            });
        },
        stop() { },
        SettingsPanel: () => {
            const [{ hideByDefault }, setSettings] = Settings.useState();
            return (React.createElement(SwitchItem, { note: "Collapse all embeds & attachments initially.", hideBorder: true, value: hideByDefault, onChange: (checked) => setSettings({ hideByDefault: checked }) }, "Collapse by default"));
        }
    };
});

module.exports = index;

/*@end @*/
