import { createPlugin, Logger, Filters, Finder, Patcher, Utils, React, Fiber } from "dium";
import { ClientActions, ExpandedGuildFolderStore } from "@dium/modules";
import { Flex, FormItem, FormSwitch, margins, SingleSelect, Text } from "@dium/components";
import { FolderIndicatorPosition, Settings } from "./settings";
import { ConnectedBetterFolderIcon } from "./icon";
import { folderModalPatch, FolderSettingsModal } from "./modal";
import { css } from "./styles.module.scss";

const guildStyles = Finder.byKeys(["guilds", "base"]);

const getGuildsOwner = () => Utils.findOwner(Utils.getFiber(document.getElementsByClassName(guildStyles.guilds)?.[0]));

const triggerRerender = async (guildsFiber: Fiber) => {
    if (await Utils.forceFullRerender(guildsFiber)) {
        Logger.log("Rerendered guilds");
    } else {
        Logger.warn("Unable to rerender guilds");
    }
};

interface PositionLabelProps {
    name: string;
}

const PositionLabel = ({ name }: PositionLabelProps): React.JSX.Element => (
    <Flex direction={Flex.Direction.HORIZONTAL} align={Flex.Align.CENTER}>
        <Text variant="text-md/normal">{name}</Text>
    </Flex>
);

export default createPlugin({
    start() {
        let FolderIcon = null;
        const guildsOwner = getGuildsOwner();

        // patch folder icon wrapper
        // icon is in same module, not exported
        const FolderIconWrapper = Finder.findWithKey<React.FunctionComponent<any>>(
            Filters.bySource("folderIconWrapper"),
        );
        Patcher.after(
            ...FolderIconWrapper,
            ({ args: [props], result }) => {
                const icon = Utils.queryTree(result, (node) => node?.props?.folderNode) as React.ReactElement<
                    any,
                    React.FunctionComponent<any>
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
                const replace = (
                    <ConnectedBetterFolderIcon
                        folderId={props.folderNode.id}
                        childProps={icon.props}
                        FolderIcon={FolderIcon}
                    />
                );
                Utils.replaceElement(icon, replace);
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

        // patch folder settings render
        Finder.waitFor(Filters.bySource(".folderName", ".onClose"), { entries: true }).then(
            (FolderSettingsModal: FolderSettingsModal) => {
                if (FolderSettingsModal) {
                    Patcher.after(FolderSettingsModal.prototype, "render", folderModalPatch, {
                        name: "GuildFolderSettingsModal",
                    });
                }
            },
        );
    },
    stop() {
        triggerRerender(getGuildsOwner());
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{ closeOnOpen, folderIndicatorPosition }, setSettings] = Settings.useState();

        return (
            <>
                <FormSwitch
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
                >
                    Close on open
                </FormSwitch>
                <FormItem className={margins.marginBottom20} title="Folder Indicator Position">
                    <SingleSelect
                        value={folderIndicatorPosition}
                        options={[
                            {
                                value: FolderIndicatorPosition.TopLeft,
                                label: "Default (Top Left)",
                            },
                            {
                                value: FolderIndicatorPosition.TopRight,
                                label: "Top Right",
                            },
                            {
                                value: FolderIndicatorPosition.BottomLeft,
                                label: "Bottom Left",
                            },
                            {
                                value: FolderIndicatorPosition.BottomRight,
                                label: "Bottom Right",
                            },
                        ]}
                        onChange={(value) => setSettings({ folderIndicatorPosition: value })}
                        renderOptionLabel={({ label }) => <PositionLabel name={label} />}
                        renderOptionValue={([{ label }]) => <PositionLabel name={label} />}
                    />
                </FormItem>
            </>
        );
    },
});
