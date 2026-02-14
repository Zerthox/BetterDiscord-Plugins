import { createPlugin, Logger, Filters, Finder, Patcher, Utils, React, Fiber } from "dium";
import { ClientActions, ExpandedGuildFolderStore } from "@dium/modules";
import { FormSwitch } from "@dium/components";
import { Settings } from "./settings";
import { ConnectedBetterFolderIcon, FolderIcon, PropsWithFolderNode } from "./icon";
import { FolderSettingsClass, mountFolderSettingsPatch, renderFolderSettingsPatch } from "./settings-modal";
import { css } from "./styles.module.scss";

const guildStyles = Finder.byKeys(["guilds", "base"]);

const getGuildsOwner = () => {
    const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
    if (node) {
        const owner = Utils.findOwner(Utils.getFiber(node));
        if (!owner) {
            Logger.warn("Unable to find guilds owner");
        }
        return owner;
    } else {
        Logger.warn("Unable to find guilds node");
    }
    return null;
};

const triggerRerender = async (guildsFiber: Fiber) => {
    if (guildsFiber && (await Utils.forceFullRerender(guildsFiber))) {
        Logger.log("Rerendered guilds");
    } else {
        Logger.warn("Unable to rerender guilds");
    }
};

export default createPlugin({
    start() {
        let FolderIcon: FolderIcon = null;
        const guildsOwner = getGuildsOwner();

        // patch folder icon wrapper
        // icon is in same module, not exported
        const FolderIconWrapper = Finder.findWithKey<React.FunctionComponent<PropsWithFolderNode>>(
            Filters.bySource("folderNode:", "folderGroupId:", "folderName"),
        );
        Patcher.after(
            ...FolderIconWrapper,
            ({ args: [props], result }) => {
                const icon = Utils.queryTree(result, (node) => node?.props?.folderNode) as React.ReactElement<
                    PropsWithFolderNode,
                    FolderIcon
                >;
                if (!icon) {
                    return Logger.error("Unable to find FolderIcon component");
                }

                // save icon component
                if (!FolderIcon) {
                    Logger.log("Found FolderIcon component");
                    FolderIcon = icon.type;
                }

                // replace icon with own component
                Utils.replaceElement(
                    icon,
                    <ConnectedBetterFolderIcon
                        folderId={props.folderNode.id}
                        childProps={icon.props}
                        FolderIcon={FolderIcon}
                    />,
                );
            },
            { name: "FolderIconWrapper" },
        );
        triggerRerender(guildsOwner);

        // patch folder expand
        Patcher.after(ClientActions, "toggleGuildFolderExpand", ({ original, args: [folderId] }) => {
            if (Settings.current.closeOnOpen) {
                for (const id of ExpandedGuildFolderStore.getExpandedFolders()) {
                    if (id !== folderId) {
                        original(id);
                    }
                }
            }
        });

        // patch folder settings class
        Finder.waitFor<FolderSettingsClass>(Filters.bySource(".folderName", ".onClose"), { entries: true }).then(
            (FolderSettings) => {
                Patcher.after(FolderSettings.prototype, "render", renderFolderSettingsPatch, {
                    name: "FolderSettings render",
                });
                Patcher.after(FolderSettings.prototype, "componentDidMount", mountFolderSettingsPatch, {
                    name: "FolderSettings mount",
                    force: true,
                });
            },
        );
    },
    stop() {
        triggerRerender(getGuildsOwner());
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{ closeOnOpen }, setSettings] = Settings.useState();

        return (
            <FormSwitch
                label="Close on open"
                description="Close other folders when opening a new folder"
                checked={closeOnOpen}
                onChange={(checked) => {
                    if (checked) {
                        // close all folders except one
                        for (const id of Array.from(ExpandedGuildFolderStore.getExpandedFolders()).slice(1)) {
                            ClientActions.toggleGuildFolderExpand(id);
                        }
                    }
                    setSettings({ closeOnOpen: checked });
                }}
            />
        );
    },
});
