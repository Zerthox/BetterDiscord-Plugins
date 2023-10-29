import {createPlugin, Logger, Filters, Finder, Patcher, Utils, React, Fiber} from "dium";
import {ClientActions, ExpandedGuildFolderStore} from "@dium/modules";
import {FormSwitch, GuildsNav} from "@dium/components";
import {Settings} from "./settings";
import {ConnectedBetterFolderIcon} from "./icon";
import {folderModalPatch, FolderSettingsModal} from "./modal";
import {css} from "./styles.module.scss";

const guildStyles = Finder.byKeys(["guilds", "base"]);

const getGuildsOwner = () => Utils.findOwner(Utils.getFiber(document.getElementsByClassName(guildStyles.guilds)?.[0]));

const triggerRerender = async (guildsFiber: Fiber) => {
    if (await Utils.forceFullRerender(guildsFiber)) {
        Logger.log("Rerendered guilds");
    } else {
        Logger.warn("Unable to rerender guilds");
    }
};

export default createPlugin({
    start() {
        let foundItem = false;
        let FolderIcon = null;
        const guildsOwner = getGuildsOwner();

        // find folder within guilds nav
        Patcher.after(GuildsNav, "type", ({result, cancel}) => {
            const target = Utils.queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
            if (!target) {
                return Logger.error("Unable to find chain patch target");
            }

            // chain patch into the component
            Utils.hookFunctionComponent(target, (result) => {
                if (foundItem) {
                    return;
                }

                const guildItem = Utils.queryTree(result, (node) => node?.props?.folderNode);
                if (!guildItem) {
                    return Logger.error("Unable to find guild item component");
                }

                // guild item component found, cancel parent patch
                foundItem = true;
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
            });
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

        // patch folder settings render
        Finder.waitFor(Filters.bySource(".GUILD_FOLDER_NAME"), {entries: true}).then((FolderSettingsModal: FolderSettingsModal) => {
            if (FolderSettingsModal) {
                Patcher.after(
                    FolderSettingsModal.prototype,
                    "render",
                    (data) => folderModalPatch(data, FolderIcon),
                    {name: "GuildFolderSettingsModal"}
                );
            }
        });
    },
    stop() {
        triggerRerender(getGuildsOwner());
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{closeOnOpen}, setSettings] = Settings.useState();

        return (
            <FormSwitch
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
            >Close on open</FormSwitch>
        );
    }
});
