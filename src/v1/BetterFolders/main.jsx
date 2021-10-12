/**
 * BetterFolders plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
    Dispatcher: BdApi.findModuleByProps("Dispatcher").Dispatcher,
    ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
    FolderStore: BdApi.findModuleByProps("getSortedGuilds"),
    FolderState: BdApi.findModuleByProps("getExpandedFolders"),
    UserSettings: BdApi.findModuleByProps("updateLocalSettings")
};

/** Component storage */
const Component = {
    Flex: BdApi.findModuleByDisplayName("Flex"),
    GuildFolders: BdApi.findModuleByProps("GuildFolderComponent"),
    GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
    FolderIcon: null,
    Form: BdApi.findModuleByProps("FormSection", "FormText"),
    TextInput: BdApi.findModuleByDisplayName("TextInput"),
    RadioGroup: BdApi.findModuleByDisplayName("RadioGroup"),
    Button: BdApi.findModuleByProps("Link", "Hovers"),
    SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
    ImageInput: BdApi.findModuleByDisplayName("ImageInput")
};

/** Selector storage */
const Selector = {
    flex: BdApi.findModuleByProps("flex"),
    modal: BdApi.findModuleByProps("permissionsTitle"),
    button: BdApi.findModuleByProps("colorWhite"),
    margins: BdApi.findModuleByProps("marginLarge"),
    folder: BdApi.findModuleByProps("folder", "expandedFolderBackground", "wrapper"),
    guilds: BdApi.findModuleByProps("guilds", "base"),
    tree: BdApi.findModuleByProps("scroller", "tree")
};

/** Plugin styles */
const Styles = $include("./styles.scss");

/** Store for Folders */
const BetterFolderStore = (() => {
    // read folders data
    const Folders = BdApi.loadData("BetterFolders", "folders") || {};

    // create dispatcher
    const FoldersDispatcher = new Module.Dispatcher();

    // create custom store
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

    // return new custom store instance
    return new BetterFolderStore(FoldersDispatcher, {
        update() {},
        delete() {}
    });
})();

/** BetterFolderIcon component */
function BetterFolderIcon({icon, always, childProps}) {
    // eslint-disable-next-line new-cap
    const result = Component.FolderIcon(childProps);
    if (icon && (childProps.expanded || always)) {
        result.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon}`}}/>;
    }
    return result;
}

const BetterFolderIconContainer = Flux.connectStores(
    [BetterFolderStore],
    ({folderId}) => ({...BetterFolderStore.getFolder(folderId)})
)(BetterFolderIcon);

/** BetterFolderUploader component */
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
        const {Flex, Button, ImageInput, SwitchItem, Form: {FormText}} = Component;
        return (
            <>
                <Flex align={Selector.flex.alignCenter}>
                    <Button color={Selector.button.colorWhite} look={Selector.button.lookOutlined}>
                        Upload Image
                        <ImageInput onChange={(e) => this.setState({icon: e})}/>
                    </Button>
                    <FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</FormText>
                    <BetterFolderIcon
                        childProps={{
                            color: this.props.color,
                            guildIds: []
                        }}
                        icon={this.state.icon}
                        always
                    />
                </Flex>
                <SwitchItem
                    hideBorder
                    className={Selector.margins.marginTop8}
                    value={this.state.always}
                    onChange={(checked) => this.setState({always: checked})}
                >Always display icon</SwitchItem>
            </>
        );
    }
}

// eslint-disable-next-line no-unused-vars
class Plugin {
    constructor() {
        this.defaults = {
            closeOnOpen: false
        };
    }

    getSettings() {
        return (props) => (
            <Component.SwitchItem
                note="Close other folders when opening a new folder"
                hideBorder
                value={props.closeOnOpen}
                onChange={(checked) => {
                    if (checked) {
                        // close all folders except one
                        for (const id of Array.from(Module.FolderState.getExpandedFolders()).slice(1)) {
                            Module.ClientActions.toggleGuildFolderExpand(id);
                        }
                    }
                    props.update({closeOnOpen: checked});
                }}
            >Close On Open</Component.SwitchItem>
        );
    }

    start() {
        // inject styles
        this.injectCSS(Styles);

        // patch guild folder render function
        this.createPatch(Component.GuildFolders.GuildFolderComponent.type, "render", {name: "GuildFolder", type: "component", after: ({methodArguments: [props], returnValue}) => {
            const container = qReact(returnValue, (el) => el.props.children.type.displayName === "FolderIcon");
            if (container) {
                const icon = container.props.children;
                if (!Component.FolderIcon) {
                    Component.FolderIcon = icon.type;
                }
                container.props.children = <BetterFolderIconContainer folderId={props.folderId} childProps={icon.props}/>;
            } else {
                this.warn("Unable to find folder icon container");
            }
        }});

        // patch guild folder settings modal render function
        this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {after: ({thisObject, returnValue}) => {
            const {RadioGroup, Form: {FormItem}} = Component;
            const id = thisObject.props.folderId;

            // add custom props
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

            // add icon select
            const children = qReact(returnValue, (e) => e.type === "form").props.children;
            const {className} = children[0].props;
            children.push(
                <FormItem title="Icon" className={className}>
                    <RadioGroup value={thisObject.state.iconType}
                        options={[
                            {
                                name: "Default Icon",
                                value: "default"
                            },
                            {
                                name: "Custom Icon",
                                value: "custom"
                            }
                        ]}
                        onChange={({value}) => thisObject.setState({iconType: value})}
                    />
                </FormItem>
            );

            // patch submit click
            const button = qReact(returnValue, (e) => e.props.type === "submit");
            BdApi.monkeyPatch(button.props, "onClick", {silent: true, after: () => {
                if (thisObject.state.iconType !== "default" && thisObject.state.icon) {
                    BetterFolderStore.setFolder(id, {
                        icon: thisObject.state.icon,
                        always: thisObject.state.always
                    });
                } else if (thisObject.state.iconType === "default" && BetterFolderStore.getFolder(id)) {
                    BetterFolderStore.deleteFolder(id);
                }
            }});

            if (thisObject.state.iconType !== "default") {
                // render custom icon select
                children.push(
                    <FormItem title="Custom Icon" className={className}>
                        <BetterFolderUploader
                            color={thisObject.state.color}
                            icon={thisObject.state.icon}
                            always={thisObject.state.always}
                            onChange={({icon, always}) => thisObject.setState({icon, always})}
                        />
                    </FormItem>
                );
            }
        }});

        // patch client actions toggle guild folder expand function
        this.createPatch(Module.ClientActions, "toggleGuildFolderExpand", {name: "ClientActions", after: ({methodArguments: [folderId], originalMethod}) => {
            if (this.settings.closeOnOpen) {
                for (const id of Module.FolderState.getExpandedFolders()) {
                    if (id !== folderId) {
                        originalMethod(id);
                    }
                }
            }
        }});

        // force update
        this.triggerRerender();
    }

    stop() {
        // force update
        this.triggerRerender();
    }

    triggerRerender() {
        for (const node of document.getElementsByClassName(Selector.folder.wrapper)) {
            const fiber = BdApi.getInternalInstance(node);
            if (fiber && fiber.return.type && fiber.return.type === Component.GuildFolders.GuildFolderComponent.type) {
                const {lastRenderedState, dispatch} = fiber.return.memoizedState.queue;
                dispatch(!lastRenderedState);
                setTimeout(() => dispatch(lastRenderedState), 0);
            } else {
                this.warn("Unable to force update folder fiber");
                return;
            }
        }
        this.log("Successfully triggered folder rerenders");
    }
}
