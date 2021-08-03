/**
 * @name OnlineFriendCount
 * @author Zerthox
 * @version 1.4.3
 * @description Add the old online friend count back to guild list. Because nostalgia.
 * @authorLink https://github.com/Zerthox
 * @donate https://paypal.me/zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/v1/OnlineFriendCount.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/v1/OnlineFriendCount.plugin.js
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
    Constants: BdApi.findModuleByProps("Permissions"),
    Status: BdApi.findModuleByProps("getState", "getStatus"),
    Relationships: BdApi.findModuleByProps("isFriend", "getRelationshipCount")
};
const Component = {
    Link: BdApi.findModuleByProps("NavLink").Link
};
const Selector = {
    guilds: BdApi.findModuleByProps("guilds", "base"),
    list: BdApi.findModuleByProps("listItem"),
    friendsOnline: "friendsOnline-2JkivW"
};
const Styles = `/*! OnlineFriendCount v1.4.3 styles */
.friendsOnline-2JkivW {
    color: rgba(255, 255, 255, 0.3);
    text-align: center;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.3;
    width: 70px;
    word-wrap: normal;
    white-space: nowrap;
    cursor: pointer;
}
.friendsOnline-2JkivW:hover {
    color: rgba(255, 255, 255, 0.5);
}`;

function OnlineCount({online}) {
    return React.createElement(
        "div",
        {
            className: Selector.list.listItem
        },
        React.createElement(
            Component.Link,
            {
                to: {
                    pathname: "/channels/@me"
                }
            },
            React.createElement(
                "div",
                {
                    className: Selector.friendsOnline
                },
                online,
                " Online"
            )
        )
    );
}

const OnlineCountContainer = Flux.connectStores([Module.Status, Module.Relationships], () => {
    const {RelationshipTypes, StatusTypes} = Module.Constants;
    const relationships = Module.Relationships.getRelationships();
    const filtered = Object.entries(relationships).filter(
        ([id, type]) => type === RelationshipTypes.FRIEND && Module.Status.getStatus(id) !== StatusTypes.OFFLINE
    );
    return {
        online: filtered.length
    };
})(OnlineCount);

class Plugin {
    start() {
        this.injectCSS(Styles);
        const guilds = this.findGuilds();

        const findChildFunc = (el) => {
            while (!(el.props.children instanceof Function)) {
                if (!el.props.children) {
                    this.log(`Unable to find children function for "${el.type.toString()}"`);
                    return null;
                }

                el = el.props.children;
            }

            return el;
        };

        this.createPatch(guilds.type.prototype, "render", {
            after: ({returnValue}) => {
                BdApi.monkeyPatch(findChildFunc(returnValue).props, "children", {
                    silent: true,
                    after: ({returnValue}) => {
                        BdApi.monkeyPatch(findChildFunc(returnValue).props, "children", {
                            silent: true,
                            after: ({returnValue}) => {
                                const scroller = qReact(returnValue, (e) =>
                                    e.props.children.find((e) => e.type.displayName === "ConnectedUnreadDMs")
                                );

                                if (!scroller) {
                                    this.error("Error during render: Cannot find guilds scroller Component");
                                    return;
                                }

                                const {children} = scroller.props;
                                const index = children.indexOf(
                                    qReact(scroller, (e) => e.type.displayName === "ConnectedUnreadDMs")
                                );
                                children.splice(
                                    index > -1 ? index : 1,
                                    0,
                                    React.createElement(OnlineCountContainer, null)
                                );
                            }
                        });
                    }
                });
            }
        });
        guilds.stateNode.forceUpdate();
    }

    stop() {
        this.findGuilds().stateNode.forceUpdate();
    }

    findGuilds() {
        let guilds = BdApi.getInternalInstance(document.getElementsByClassName(Selector.guilds.guilds)[0]);

        if (!guilds) {
            this.error("Cannot find Guilds element fiber");
            return;
        }

        while (!guilds.type || guilds.type.displayName !== "Guilds") {
            if (!guilds.return) {
                this.error("Cannot find Guilds Component");
                return;
            }

            guilds = guilds.return;
        }

        return guilds;
    }
}

module.exports = class Wrapper extends Plugin {
    getName() {
        return "OnlineFriendCount";
    }

    getVersion() {
        return "1.4.3";
    }

    getAuthor() {
        return "Zerthox";
    }

    getDescription() {
        return "Add the old online friend count back to guild list. Because nostalgia.";
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
