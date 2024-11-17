import {createPlugin, Logger, Filters, Finder, Patcher, Utils, React, Fiber} from "dium";
import {ClientActions, ExpandedGuildFolderStore} from "@dium/modules";
import {FormSwitch} from "@dium/components";
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
        let FolderIcon = null;
        const guildsOwner = getGuildsOwner();

        // patch folder icon wrapper
        // icon is in same module, not exported
        const FolderIconWrapper = Finder.findWithKey<React.FunctionComponent<any>>(Filters.bySource(".expandedFolderIconWrapper"));
        Patcher.after(...FolderIconWrapper, ({args: [props], result}) => {
            const iconParent = Utils.queryTree(result, (node) => node?.props?.children?.props?.folderNode);
            if (!iconParent) {
                return Logger.error("Unable to find FolderIcon component");
            }
            const icon = iconParent.props.children as React.ReactElement<any, React.FunctionComponent<any>>;

            // save icon component
            if (!FolderIcon) {
                Logger.log("Found FolderIcon component");
                FolderIcon = icon.type;
            }

            // replace icon with own component
            iconParent.props.children = <ConnectedBetterFolderIcon
                folderId={props.folderNode.id}
                childProps={icon.props}
                FolderIcon={FolderIcon}
            />;
        }, {name: "FolderIconWrapper"});
        triggerRerender(guildsOwner);

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

        // patch folder settings render
        Finder.waitFor(Filters.bySource(".folderName", ".onClose"), {entries: true}).then((FolderSettingsModal: FolderSettingsModal) => {
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
