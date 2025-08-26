import { Finder, Logger, React, Utils } from "dium";
import { Settings, FolderData } from "./settings";
import styles from "./styles.module.scss";

const folderStyles = Finder.byKeys(["folderIcon", "folderIconWrapper", "folderPreviewWrapper"]);

export const renderIcon = (data: FolderData): React.JSX.Element => (
    <div className={styles.customIcon} style={{ backgroundImage: data?.icon ? `url(${data.icon})` : null }} />
);

export interface BetterFolderIconProps {
    data?: FolderData;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

export const BetterFolderIcon = ({ data, childProps, FolderIcon }: BetterFolderIconProps): React.JSX.Element => {
    if (FolderIcon) {
        const result = FolderIcon(childProps) as React.JSX.Element;
        if (data?.icon) {
            const replace = renderIcon(data);
            const iconWrapper = Utils.queryTree(
                result,
                (node) => node?.props?.className === folderStyles.folderIconWrapper,
            );
            if (iconWrapper) {
                Utils.replaceElement(iconWrapper, replace);
            } else {
                Logger.error("Failed to find folderIconWrapper element");
            }
            if (data.always) {
                const previewWrapper = Utils.queryTree(
                    result,
                    (node) => node?.props?.className === folderStyles.folderPreviewWrapper,
                );
                if (previewWrapper) {
                    Utils.replaceElement(previewWrapper, replace);
                } else {
                    Logger.error("Failed to find folderPreviewWrapper element");
                }
            }
        }
        return result;
    } else {
        return null;
    }
};

export interface ConnectedBetterFolderIconProps {
    folderId: number;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

const compareFolderData = (a?: FolderData, b?: FolderData): boolean => a?.icon === b?.icon && a?.always === b?.always;

export const ConnectedBetterFolderIcon = ({
    folderId,
    ...props
}: ConnectedBetterFolderIconProps): React.JSX.Element => {
    const data = Settings.useSelector((current) => current.folders[folderId], [folderId], compareFolderData);
    return <BetterFolderIcon data={data} {...props} />;
};
