/**
 * @name BetterFolders
 * @author Zerthox
 * @version 2.3.1
 * @description Add new functionality to server folders.
 * @authorLink https://github.com/Zerthox
 * @donate https://paypal.me/zerthox
 * @website https://github.com/Zerthox/BetterDiscord-Plugins
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/tree/master/v1/betterfolders.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Zerthox/BetterDiscord-Plugins/master/v1/betterfolders.plugin.js
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
    Dispatcher: BdApi.findModuleByProps("Dispatcher").Dispatcher,
    ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
    FolderStore: BdApi.findModuleByProps("getExpandedFolders")
};
const Component = {
    Flex: BdApi.findModuleByDisplayName("Flex"),
    GuildFolder: BdApi.findModule(
        (m) => m && m.type && m.type.render && m.type.render.toString().includes("defaultFolderName")
    ),
    GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
    Form: BdApi.findModuleByProps("FormSection", "FormText"),
    TextInput: BdApi.findModuleByDisplayName("TextInput"),
    RadioGroup: BdApi.findModuleByDisplayName("RadioGroup"),
    Button: BdApi.findModuleByProps("Link", "Hovers"),
    SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
    ImageInput: BdApi.findModuleByDisplayName("ImageInput")
};
const Selector = {
    flex: BdApi.findModuleByProps("flex"),
    modal: BdApi.findModuleByProps("permissionsTitle"),
    button: BdApi.findModuleByProps("colorWhite"),
    margins: BdApi.findModuleByProps("marginLarge"),
    folder: BdApi.findModuleByProps("folder", "expandedFolderBackground", "wrapper"),
    guilds: BdApi.findModuleByProps("guilds", "base"),
    tree: BdApi.findModuleByProps("scroller", "tree")
};
const Styles = `/*! BetterFolders v2.3.1 styles */
.betterFolders-customIcon {
    width: 100%;
    height: 100%;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

.betterFolders-preview {
    margin: 0 10px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 16px;
    cursor: default;
}`;

const BetterFolderStore = (() => {
    const Folders = BdApi.loadData("BetterFolders", "folders") || {};
    const FoldersDispatcher = new Module.Dispatcher();

    class BetterFolderStore extends Flux.Store {
        setFolder(id, data) {
            if (!Folders[id]) {
                Folders[id] = {};
            }

            Object.assign(Folders[id], data);
            FoldersDispatcher.dirtyDispatch({
                type: "update",
                folderId: id,
                data
            });
            BdApi.saveData("BetterFolders", "folders", Folders);
        }

        getFolder(id) {
            return Folders[id];
        }

        deleteFolder(id) {
            delete Folders[id];
            FoldersDispatcher.dirtyDispatch({
                type: "delete",
                folderId: id
            });
            BdApi.saveData("BetterFolders", "folders", Folders);
        }
    }

    return new BetterFolderStore(FoldersDispatcher, {
        update() {},

        delete() {}
    });
})();

function BetterFolderIcon({icon, always, childProps}) {
    const result = Component.FolderIcon.call(this, childProps);

    if (icon) {
        if (childProps.expanded) {
            result.props.children[0] = React.createElement("div", {
                className: "betterFolders-customIcon",
                style: {
                    backgroundImage: `url(${icon}`
                }
            });
        } else if (always) {
            result.props.children[1] = React.createElement("div", {
                className: "betterFolders-customIcon",
                style: {
                    backgroundImage: `url(${icon}`
                }
            });
        }
    }

    return result;
}

const BetterFolderIconContainer = Flux.connectStores([BetterFolderStore], ({folderId}) => ({
    ...BetterFolderStore.getFolder(folderId)
}))(BetterFolderIcon);

class BetterFolderUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            icon: props.icon,
            always: props.always
        };
    }

    setState(state) {
        super.setState(state, () => this.props.onChange && this.props.onChange(this.state));
    }

    render() {
        const {
            Flex,
            Button,
            ImageInput,
            SwitchItem,
            Form: {FormText}
        } = Component;
        return React.createElement(
            React.Fragment,
            null,
            React.createElement(
                Flex,
                {
                    align: Selector.flex.alignCenter
                },
                React.createElement(
                    Button,
                    {
                        color: Selector.button.colorWhite,
                        look: Selector.button.lookOutlined
                    },
                    "Upload Image",
                    React.createElement(ImageInput, {
                        onChange: (e) =>
                            this.setState({
                                icon: e
                            })
                    })
                ),
                React.createElement(
                    FormText,
                    {
                        type: "description",
                        style: {
                            margin: "0 10px 0 40px"
                        }
                    },
                    "Preview:"
                ),
                React.createElement(BetterFolderIcon, {
                    childProps: {
                        color: this.props.color,
                        guildIds: []
                    },
                    icon: this.state.icon,
                    always: true
                })
            ),
            React.createElement(
                SwitchItem,
                {
                    hideBorder: true,
                    className: Selector.margins.marginTop8,
                    value: this.state.always,
                    onChange: (checked) =>
                        this.setState({
                            always: checked
                        })
                },
                "Always display icon"
            )
        );
    }
}

class Plugin {
    constructor() {
        this.defaults = {
            closeOnOpen: false
        };
    }

    getSettings() {
        return (props) =>
            React.createElement(
                Component.SwitchItem,
                {
                    note: "Close other folders when opening a new folder",
                    hideBorder: true,
                    value: props.closeOnOpen,
                    onChange: (checked) => {
                        if (checked) {
                            for (const id of Array.from(Module.FolderStore.getExpandedFolders()).slice(1)) {
                                Module.ClientActions.toggleGuildFolderExpand(id);
                            }
                        }

                        props.update({
                            closeOnOpen: checked
                        });
                    }
                },
                "Close On Open"
            );
    }

    start() {
        this.injectCSS(Styles);
        this.createPatch(Component.GuildFolder.type, "render", {
            name: "GuildFolder",
            type: "component",
            after: ({methodArguments: [props], returnValue}) => {
                const container = qReact(returnValue, (e) => e.props.children.type.displayName === "FolderIcon");

                if (container) {
                    const icon = container.props.children;

                    if (!Component.FolderIcon) {
                        Component.FolderIcon = icon.type;
                    }

                    container.props.children = React.createElement(BetterFolderIconContainer, {
                        folderId: props.folderId,
                        childProps: icon.props
                    });
                }
            }
        });
        this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {
            after: ({thisObject, returnValue}) => {
                const {
                    RadioGroup,
                    Form: {FormItem}
                } = Component;
                const id = thisObject.props.folderId;

                if (!thisObject.state.iconType) {
                    const folder = BetterFolderStore.getFolder(id);

                    if (folder) {
                        Object.assign(thisObject.state, {
                            iconType: "custom",
                            icon: folder.icon,
                            always: folder.always
                        });
                    } else {
                        Object.assign(thisObject.state, {
                            iconType: "default",
                            icon: null,
                            always: false
                        });
                    }
                }

                const children = qReact(returnValue, (e) => e.type === "form").props.children;
                const {className} = children[0].props;
                children.push(
                    React.createElement(
                        FormItem,
                        {
                            title: "Icon",
                            className: className
                        },
                        React.createElement(RadioGroup, {
                            value: thisObject.state.iconType,
                            options: [
                                {
                                    name: "Default Icon",
                                    value: "default"
                                },
                                {
                                    name: "Custom Icon",
                                    value: "custom"
                                }
                            ],
                            onChange: ({value}) =>
                                thisObject.setState({
                                    iconType: value
                                })
                        })
                    )
                );
                const button = qReact(returnValue, (e) => e.props.type === "submit");
                BdApi.monkeyPatch(button.props, "onClick", {
                    silent: true,
                    after: () => {
                        if (thisObject.state.iconType !== "default" && thisObject.state.icon) {
                            BetterFolderStore.setFolder(id, {
                                icon: thisObject.state.icon,
                                always: thisObject.state.always
                            });
                        } else if (thisObject.state.iconType === "default" && BetterFolderStore.getFolder(id)) {
                            BetterFolderStore.deleteFolder(id);
                        }
                    }
                });

                if (thisObject.state.iconType !== "default") {
                    children.push(
                        React.createElement(
                            FormItem,
                            {
                                title: "Custom Icon",
                                className: className
                            },
                            React.createElement(BetterFolderUploader, {
                                color: thisObject.state.color,
                                icon: thisObject.state.icon,
                                always: thisObject.state.always,
                                onChange: ({icon, always}) =>
                                    thisObject.setState({
                                        icon,
                                        always
                                    })
                            })
                        )
                    );
                }
            }
        });
        this.createPatch(Module.ClientActions, "toggleGuildFolderExpand", {
            name: "ClientActions",
            after: ({methodArguments: [folderId], originalMethod}) => {
                if (this.settings.closeOnOpen) {
                    for (const id of Module.FolderStore.getExpandedFolders()) {
                        id !== folderId && originalMethod(id);
                    }
                }
            }
        });
        this.triggerRerender();
    }

    stop() {
        this.triggerRerender();
    }

    async triggerRerender() {
        const tree = BdApi.getInternalInstance(document.getElementsByClassName(Selector.tree.tree)[0]);

        if (!tree) {
            this.error("Unable to trigger rerender: Cannot find tree element fiber");
            return;
        }

        BdApi.monkeyPatch(tree.return, "type", {
            silent: true,
            once: true,
            after: ({returnValue}) => {
                const servers = qReact(returnValue, (e) => e.props.children.find((e) => e.props.folderId));

                if (!servers) {
                    this.error("Unable to trigger rerender: Cannot find servers list");
                    return;
                }

                for (const {props} of servers.props.children) {
                    if (props.folderId) {
                        props.draggable = !props.draggable;
                    }
                }
            }
        });
        let guilds = BdApi.getInternalInstance(document.getElementsByClassName(Selector.guilds.guilds)[0]);

        if (!guilds) {
            this.error("Unable to trigger rerender: Cannot find Guilds element fiber");
            return;
        }

        while (!guilds.type || guilds.type.displayName !== "Guilds") {
            if (!guilds.return) {
                this.error("Unable to trigger rerender: Cannot find Guilds Component");
                return;
            }

            guilds = guilds.return;
        }

        function forceUpdate(stateNode) {
            return new Promise((resolve) => stateNode.forceUpdate(() => resolve()));
        }

        await forceUpdate(guilds.stateNode);
        await forceUpdate(guilds.stateNode);
        this.log("Successfully triggered rerender");
    }
}

module.exports = class Wrapper extends Plugin {
    getName() {
        return "BetterFolders";
    }

    getVersion() {
        return "2.3.1";
    }

    getAuthor() {
        return "Zerthox";
    }

    getDescription() {
        return "Add new functionality to server folders.";
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
