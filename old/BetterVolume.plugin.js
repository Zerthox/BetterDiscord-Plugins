/**
 * @name BetterVolume
 * @author Zerthox
 * @version 1.0.0
 * @description Set user volume values manually instead of using a limited slider.
 * @authorLink https://github.com/Zerthox
 * @donate https://paypal.me/zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/v1/bettervolume.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/v1/bettervolume.plugin.js
 */

/* @cc_on
    @if (@_jscript)
        var name = WScript.ScriptName.split(".")[0];
        var shell = WScript.CreateObject("WScript.Shell");
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        shell.Popup("Do NOT run random scripts from the internet with the Windows Script Host!\n\nYou are supposed to move this file to your BandagedBD/BetterDiscord plugins folder.", 0, name + ": Warning!", 0x1030);
        var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
        if (!fso.FolderExists(pluginsPath)) {
            if (shell.Popup("Unable to find the BetterDiscord plugins folder on your computer.\nOpen the download page of BandagedBD/BetterDiscord?", 0, name + ": BetterDiscord installation not found", 0x14) === 6) {
                shell.Exec("explorer \"https://github.com/rauenzi/betterdiscordapp/releases\"");
            }
        } else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
            shell.Popup("This plugin is already in the correct folder.\nNavigate to the \"Plugins\" settings tab in Discord and enable it there.", 0, name, 0x40);
        } else {
            shell.Exec("explorer " + pluginsPath);
        }
        WScript.Quit();
    @else
@*/

const {React, ReactDOM} = BdApi;
const Flux = BdApi.findModuleByProps("connectStores");

function qReact(node, query) {
    let match = false;

    try {
        match = query(node);
    } catch (err) {
        console.debug("Suppressed error in qReact query:\n", err);
    }

    if (match) {
        return node;
    } else if (node && node.props && node.props.children) {
        for (const child of [node.props.children].flat()) {
            const result = qReact(child, query);

            if (result) {
                return result;
            }
        }
    }

    return null;
}

const Module = {
    SettingsStore: BdApi.findModuleByProps("getLocalVolume"),
    Audio: BdApi.findModuleByProps("setLocalVolume")
};
const Component = {
    ControlItem: BdApi.findModule(
        (m) => m && m.default instanceof Function && m.default.displayName === "MenuControlItem"
    )
};
const Styles = `/*! BetterVolume v1.0.0 styles */
.container-BetterVolume {
    margin: 0px 8px;
    padding: 3px 6px;
    background: var(--background-primary);
    border-radius: 3px;
    display: flex;
}

.input-BetterVolume {
    margin-right: 2px;
    flex-grow: 1;
    background: transparent;
    border: none;
    color: var(--interactive-normal);
    font-weight: 500;
}`;

function VolumeInput({value, onChange}) {
    return React.createElement(
        "div",
        {
            className: "container-BetterVolume"
        },
        React.createElement("input", {
            type: "number",
            min: "0",
            max: "999999",
            value: Math.round((value + Number.EPSILON) * 100) / 100,
            onChange: ({target}) => onChange(Math.min(Math.max(target.value, target.min), target.max)),
            className: "input-BetterVolume"
        }),
        React.createElement("span", null, "%")
    );
}

const ConnectedVolumeInput = Flux.connectStores([Module.SettingsStore], ({control: {props: {value, onChange}}}) => ({
    value,
    onChange
}))(VolumeInput);

class Plugin {
    start() {
        this.injectCSS(Styles);
        this.createPatch(Component.ControlItem, "default", {
            name: "MenuControlItem",
            after: ({methodArguments: [props], returnValue}) => {
                if (props.id === "user-volume") {
                    const slider = qReact(returnValue, (e) => e.props.maxValue === 200);

                    if (!slider) {
                        this.error("Unable to find slider");
                        return returnValue;
                    }

                    returnValue.props.children = [
                        returnValue.props.children,
                        React.createElement(ConnectedVolumeInput, {
                            control: slider
                        })
                    ].flat();
                }

                return returnValue;
            }
        });
    }

    stop() {}
}

module.exports = class Wrapper extends Plugin {
    getName() {
        return "BetterVolume";
    }

    getVersion() {
        return "1.0.0";
    }

    getAuthor() {
        return "Zerthox";
    }

    getDescription() {
        return "Set user volume values manually instead of using a limited slider.";
    }

    log(...msgs) {
        console.log(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    warn(...msgs) {
        console.warn(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    error(...msgs) {
        console.error(
            `%c[${this.getName()}] %c(v${this.getVersion()})`,
            "color: #3a71c1; font-weight: 700;",
            "color: #666; font-size: .8em;",
            ...msgs
        );
    }

    constructor(...args) {
        super(...args);
        this._Patches = [];

        if (this.defaults) {
            this.settings = {...this.defaults, ...this.loadData("settings")};
        }
    }

    start() {
        this.log("Enabled");
        super.start();
    }

    stop() {
        while (this._Patches.length > 0) {
            this._Patches.pop()();
        }

        this.log("Unpatched all");

        if (document.getElementById(this.getName())) {
            BdApi.clearCSS(this.getName());
        }

        super.stop();
        this.log("Disabled");
    }

    saveData(id, value) {
        return BdApi.saveData(this.getName(), id, value);
    }

    loadData(id, fallback = null) {
        const data = BdApi.loadData(this.getName(), id);
        return data !== undefined && data !== null ? data : fallback;
    }

    injectCSS(css) {
        const el = document.getElementById(this.getName());

        if (!el) {
            BdApi.injectCSS(this.getName(), css);
        } else {
            el.innerHTML += "\n\n/* --- */\n\n" + css;
        }
    }

    createPatch(target, method, options) {
        options.silent = true;

        this._Patches.push(BdApi.monkeyPatch(target, method, options));

        const name =
            options.name ||
            target.displayName ||
            target.name ||
            target.constructor.displayName ||
            target.constructor.name ||
            "Unknown";
        this.log(
            `Patched ${method} of ${name} ${
                options.type === "component" || target instanceof React.Component ? "component" : "module"
            }`
        );
    }

    async forceUpdate(...classes) {
        this.forceUpdateElements(...classes.map((e) => Array.from(document.getElementsByClassName(e))).flat());
    }

    async forceUpdateElements(...elements) {
        for (const el of elements) {
            try {
                let fiber = BdApi.getInternalInstance(el);

                if (fiber) {
                    while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
                        fiber = fiber.return;
                    }

                    fiber.stateNode.forceUpdate();
                }
            } catch (e) {
                this.warn(
                    `Failed to force update "${
                        el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName
                    }" state node`
                );
                console.error(e);
            }
        }
    }
};

if (Plugin.prototype.getSettings) {
    const Flex = BdApi.findModuleByDisplayName("Flex");
    const Button = BdApi.findModuleByProps("Link", "Hovers");
    const Form = BdApi.findModuleByProps("FormItem", "FormSection", "FormDivider");
    const Margins = BdApi.findModuleByProps("marginLarge");

    class Settings extends React.Component {
        constructor(...args) {
            super(...args);
            this.state = this.props.current;
        }

        render() {
            const {name, defaults, children: Child} = this.props;
            return React.createElement(
                Form.FormSection,
                null,
                React.createElement(Child, {
                    update: (changed) => this.update({...this.state, ...changed}),
                    ...this.state
                }),
                React.createElement(Form.FormDivider, {
                    className: [Margins.marginTop20, Margins.marginBottom20].join(" ")
                }),
                React.createElement(
                    Flex,
                    {
                        justify: Flex.Justify.END
                    },
                    React.createElement(
                        Button,
                        {
                            size: Button.Sizes.SMALL,
                            onClick: () =>
                                BdApi.showConfirmationModal(name, "Reset all settings?", {
                                    onConfirm: () => this.update(defaults)
                                })
                        },
                        "Reset"
                    )
                )
            );
        }

        update(settings) {
            this.setState(settings);
            this.props.onChange(settings);
        }
    }

    module.exports.prototype.getSettingsPanel = function () {
        return React.createElement(
            Settings,
            {
                name: this.getName(),
                current: this.settings,
                defaults: this.defaults,
                onChange: (settings) => {
                    this.settings = settings;

                    if (this.update instanceof Function) {
                        this.update();
                    }

                    this.saveData("settings", settings);
                }
            },
            this.getSettings()
        );
    };
}

/* @end@*/
