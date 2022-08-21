import {createPlugin, Finder, Filters, Utils, React, Flux} from "dium";
import {ClientActions, RadioGroup, SwitchItem, Form} from "dium/modules";
import {BetterFolderIcon, BetterFolderUploader, FolderData} from "./components";
import styles from "./styles.scss";

const SortedGuildStore = Finder.byProps("getGuildsTree");
const ExpandedGuildFolderStore = Finder.byProps("getExpandedFolders");

const {FormItem} = Form;
const FolderHeader = Finder.byAnyName("FolderHeader", false) as {default: (props: any) => JSX.Element};

let FolderIcon = null;

const guildStyles = Finder.byProps("guilds", "base");

const settings = {
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>
};

export default createPlugin({styles, settings}, ({Logger, Lazy, Patcher, Data, Settings}) => {
    // backwards compatibility for old bd version
    const oldFolders = Data.load("folders");
    if (oldFolders) {
        Data.delete("folders");
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

    const triggerRerender = async () => {
        const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
        const fiber = Utils.getFiber(node);
        if (await Utils.forceFullRerender(fiber)) {
            Logger.log("Rerendered guilds");
        } else {
            Logger.warn("Unable to rerender guilds");
        }
    };

    return {
        async start() {
            // patch folder icon render
            Patcher.after(FolderHeader, "default", ({args: [props], result}) => {
                // find icon container
                const iconContainer = Utils.queryTree(result, (node) => node?.props?.children?.type?.displayName === "FolderIconContent");
                if (!iconContainer) {
                    Logger.warn("Unable to find folder icon container");
                    return;
                }

                // save icon component
                const icon = iconContainer.props.children;
                if (!FolderIcon) {
                    FolderIcon = icon.type;
                }

                // replace icon with own component
                iconContainer.props.children = <ConnectedBetterFolderIcon
                    folderId={props.folderNode.id}
                    childProps={icon.props}
                    FolderIcon={FolderIcon}
                />;
            });

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

            triggerRerender();

            // wait for modal lazy load
            const GuildFolderSettingsModal = await Lazy.waitFor(Filters.byAnyName("GuildFolderSettingsModal"));

            // patch folder settings render
            Patcher.after(GuildFolderSettingsModal.prototype, "render", ({context, result}) => {
                const {folderId} = context.props;
                const {state} = context;

                // find form
                const form = Utils.queryTree(result, (node) => node?.type === "form");
                if (!form) {
                    Logger.warn("Unable to find form");
                    return;
                }

                // add custom state
                if (!state.iconType) {
                    const {icon = null, always = false} = getFolder(folderId) ?? {};
                    Object.assign(state, {
                        iconType: icon ? "custom" : "default",
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
                                {value: "default", name: "Default Icon"},
                                {value: "custom", name: "Custom Icon"}
                            ]}
                            onChange={({value}) => context.setState({iconType: value})}
                        />
                    </FormItem>
                );

                if (state.iconType === "custom") {
                    // render custom icon options
                    const tree = SortedGuildStore.getGuildsTree();
                    children.push(
                        <FormItem title="Custom Icon" className={className}>
                            <BetterFolderUploader
                                icon={state.icon}
                                always={state.always}
                                folderNode={tree.nodes[folderId]}
                                onChange={({icon, always}) => context.setState({icon, always})}
                                FolderIcon={FolderIcon}
                            />
                        </FormItem>
                    );
                }

                // override submit onclick
                const button = Utils.queryTree(result, (node) => node?.props?.type === "submit");
                const original = button.props.onClick;
                button.props.onClick = (...args: any[]) => {
                    original(...args);

                    // update folders if necessary
                    const {folders} = Settings.current;
                    if (state.iconType === "custom" && state.icon) {
                        folders[folderId] = {icon: state.icon, always: state.always};
                        Settings.update({folders});
                    } else if ((state.iconType === "default" || !state.icon) && folders[folderId]) {
                        delete folders[folderId];
                        Settings.update({folders});
                    }
                };
            });
        },
        stop() {
            triggerRerender();
        },
        SettingsPanel: () => {
            const [{closeOnOpen}, setSettings] = Settings.useState();

            return (
                <SwitchItem
                    note="Close other folders when opening a new folder"
                    hideBorder
                    value={closeOnOpen}
                    onChange={(checked: boolean) => {
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
