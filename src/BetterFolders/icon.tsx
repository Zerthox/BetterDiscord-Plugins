import { Finder, Logger, React, Utils } from "dium";
import { Settings, FolderData, FolderIndicatorPosition } from "./settings";
import styles from "./styles.module.scss";

const folderStyles = Finder.byKeys(["folderIcon", "folderIconWrapper", "folderPreviewWrapper"]);

export const renderIcon = (data: FolderData, position: FolderIndicatorPosition): React.JSX.Element => {
    let positionClass = styles.topLeft;

    switch (position) {
        case FolderIndicatorPosition.TopRight:
            positionClass = styles.topRight;
            break;
        case FolderIndicatorPosition.BottomLeft:
            positionClass = styles.bottomLeft;
            break;
        case FolderIndicatorPosition.BottomRight:
            positionClass = styles.bottomRight;
            break;
    }

    return (
        <div
            className={`${styles.customIcon}${data?.showFolderIndicator && data?.always ? ` ${styles.showFolderIndicator}` : ""} ${positionClass}`}
            style={{ backgroundImage: data?.icon ? `url(${data.icon})` : null }}
        />
    );
};

export interface BetterFolderIconProps {
    data?: FolderData;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

export const BetterFolderIcon = ({ data, childProps, FolderIcon }: BetterFolderIconProps): React.JSX.Element => {
    const position = Settings.useSelector((current) => current.folderIndicatorPosition);

    if (FolderIcon) {
        const result = FolderIcon(childProps) as React.JSX.Element;
        if (data?.icon) {
            const replace = renderIcon(data, position);
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

const compareFolderData = (a?: FolderData, b?: FolderData): boolean =>
    a?.icon === b?.icon && a?.always === b?.always && a?.showFolderIndicator === b?.showFolderIndicator;

export const ConnectedBetterFolderIcon = ({
    folderId,
    ...props
}: ConnectedBetterFolderIconProps): React.JSX.Element => {
    const data = Settings.useSelector((current) => current.folders[folderId], [folderId], compareFolderData);
    return <BetterFolderIcon data={data} {...props} />;
};
