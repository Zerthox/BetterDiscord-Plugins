import {createPlugin, Logger, Filters, Finder, Lazy, Patcher, Data, Utils, React, Flux, Fiber} from "dium";
import {ClientActions, SortedGuildStore, ExpandedGuildFolderStore, GuildsTreeFolder} from "@dium/modules";
import {RadioGroup, SwitchItem, FormItem, GuildsNav} from "@dium/components";
import {BetterFolderIcon, BetterFolderUploader, FolderData} from "./components";
import styles from "./styles.scss";

const guildStyles = Finder.byProps(["guilds", "base"]);

const settings = {
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>
};

export default createPlugin({styles, settings}, ({Settings}) => {
    // backwards compatibility for old bd version
    const oldFolders = Data.load("folders");
    if (oldFolders) {
        Data.deleteEntry("folders");
        Settings.update({folders: oldFolders as Record<number, FolderData>});
    }

    const getFolder = (id: number) => Settings.current.folders[id];

    interface OuterIconProps {
        folderId: number;
        childProps: any;
        FolderIcon: (props: any) => JSX.Element;
    }

    const ConnectedBetterFolderIcon = Flux.default.connectStores(
        [Settings],
        ({folderId}: OuterIconProps) => ({...getFolder(folderId)})
    )(BetterFolderIcon);

    const getGuildsOwner = () => Utils.findOwner(Utils.getFiber(document.getElementsByClassName(guildStyles.guilds)?.[0]));

    const triggerRerender = async (guildsFiber: Fiber) => {
        if (await Utils.forceFullRerender(guildsFiber)) {
            Logger.log("Rerendered guilds");
        } else {
            Logger.warn("Unable to rerender guilds");
        }
    };

    let FolderIcon = null;

    return {
        start() {
            const guildsOwner = getGuildsOwner();

            // find folder within guilds nav
            Patcher.after(GuildsNav, "type", ({result, cancel}) => {
                const target = Utils.queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
                if (!target) {
                    return Logger.error("Unable to find chain patch target");
                }

                // chain patch into the component
                Utils.hookFunctionComponent(target, (result) => {
                    const guildItem = Utils.queryTree(result, (node) => node?.props?.folderNode);
                    if (!guildItem) {
                        return Logger.error("Unable to find guild item component");
                    }

                    // guild item component found, cancel parent patch
                    cancel();
                    Logger.log("Unpatched GuildsNav");

                    // patch guild item component instead
                    Patcher.after(guildItem.type, "type", ({args: [props], result}) => {
                        // not a folder
                        if (!props.folderNode) {
                            return;
                        }

                        Utils.hookFunctionComponent<any>(result, (result, props) => {
                            // find icon
                            const iconContainer = Utils.queryTree(result, (node) => "folderIconContent" in (node?.props ?? {}));
                            if (!iconContainer) {
                                return Logger.error("Unable to find folder icon container component");
                            }

                            Utils.hookFunctionComponent(iconContainer, (result) => {
                                const iconParent = Utils.queryTree(result, (node) => node?.props?.children?.props?.folderNode);
                                if (!iconParent) {
                                    return Logger.error("Unable to find folder icon component");
                                }
                                const icon = iconParent.props.children as React.ReactElement<any, React.FunctionComponent<any>>;

                                // save icon component
                                if (!FolderIcon) {
                                    FolderIcon = icon.type;
                                }

                                // replace icon with own component
                                iconParent.props.children = <ConnectedBetterFolderIcon
                                    folderId={props.folderNode.id}
                                    childProps={icon.props}
                                    FolderIcon={FolderIcon}
                                />;
                            });
                        });
                    }, {name: "GuildItem"});

                    // rerender again
                    triggerRerender(guildsOwner);
                }, true);
            }, {name: "GuildsNav"});

            // patch folder expand
            Patcher.after(ClientActions, "toggleGuildFolderExpand", ({original, args: [folderId]}) => {
                if (Settings.current.closeOnOpen) {
                    for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                        if (id !== folderId) {
                            original(id);
                        }
                    }
                }
            });

            triggerRerender(guildsOwner);

            interface FolderSettingsModalProps {
                folderId: number;
                folderName: string;
                folderColor: number;
                onClose: () => void;
                transitionState: number;
            }

            interface FolderSettingsModalState {
                name: string;
                color: number;
            }

            const enum IconType {
                Default = "default",
                Custom = "custom"
            }

            interface PatchedFolderSettingsModalState extends FolderSettingsModalState {
                iconType: IconType;
                icon?: string;
                always?: boolean;
            }

            type FolderSettingsModal = typeof React.Component<FolderSettingsModalProps, PatchedFolderSettingsModalState>;

            // patch folder settings render
            Lazy.waitFor(Filters.bySource("GUILD_FOLDER_NAME"), {entries: true}).then((FolderSettingsModal: FolderSettingsModal) => {
                if (!FolderSettingsModal) {
                    return;
                }

                Patcher.after(FolderSettingsModal.prototype as InstanceType<FolderSettingsModal>, "render", ({context, result}) => {
                    const {folderId} = context.props;
                    const {state} = context;

                    // find form
                    const form = Utils.queryTree(result as JSX.Element, (node) => node?.type === "form");
                    if (!form) {
                        Logger.warn("Unable to find form");
                        return;
                    }

                    // add custom state
                    if (!state.iconType) {
                        const {icon = null, always = false} = getFolder(folderId) ?? {};
                        Object.assign(state, {
                            iconType: icon ? IconType.Custom : IconType.Default,
                            icon,
                            always
                        });
                    }

                    // render icon select
                    const {children} = form.props;
                    const {className} = children[0].props;
                    children.push(
                        <FormItem title="Icon" className={className}>
                            <RadioGroup
                                value={state.iconType}
                                options={[
                                    {value: IconType.Default, name: "Default Icon"},
                                    {value: IconType.Custom, name: "Custom Icon"}
                                ]}
                                onChange={({value}) => context.setState({iconType: value})}
                            />
                        </FormItem>
                    );

                    if (state.iconType === IconType.Custom) {
                        // render custom icon options
                        const tree = SortedGuildStore.getGuildsTree();
                        children.push(
                            <FormItem title="Custom Icon" className={className}>
                                <BetterFolderUploader
                                    icon={state.icon}
                                    always={state.always}
                                    folderNode={tree.nodes[folderId] as GuildsTreeFolder}
                                    onChange={({icon, always}) => context.setState({icon, always})}
                                    FolderIcon={FolderIcon}
                                />
                            </FormItem>
                        );
                    }

                    // override submit onclick
                    const button = Utils.queryTree(result as JSX.Element, (node) => node?.props?.type === "submit");
                    const original = button.props.onClick;
                    button.props.onClick = (...args: any[]) => {
                        original(...args);

                        // update folders if necessary
                        const {folders} = Settings.current;
                        if (state.iconType === IconType.Custom && state.icon) {
                            folders[folderId] = {icon: state.icon, always: state.always};
                            Settings.update({folders});
                        } else if ((state.iconType === IconType.Default || !state.icon) && folders[folderId]) {
                            delete folders[folderId];
                            Settings.update({folders});
                        }
                    };
                }, {name: "GuildFolderSettingsModal"});
            });
        },
        stop() {
            triggerRerender(getGuildsOwner());
        },
        SettingsPanel: () => {
            const [{closeOnOpen}, setSettings] = Settings.useState();

            return (
                <SwitchItem
                    note="Close other folders when opening a new folder"
                    hideBorder
                    value={closeOnOpen}
                    onChange={(checked) => {
                        if (checked) {
                            // close all folders except one
                            for (const id of Array.from(ExpandedGuildFolderStore.getExpandedFolders()).slice(1)) {
                                ClientActions.toggleGuildFolderExpand(id);
                            }
                        }
                        setSettings({closeOnOpen: checked});
                    }}
                >Close on open</SwitchItem>
            );
        }
    };
});
