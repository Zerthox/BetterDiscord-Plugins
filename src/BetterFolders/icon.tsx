import {React} from "dium";
import {Settings, FolderData} from "./settings";
import styles from "./styles.module.scss";

export interface BetterFolderIconProps {
    data?: FolderData;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

export const BetterFolderIcon = ({data, childProps, FolderIcon}: BetterFolderIconProps): JSX.Element => {
    if (FolderIcon) {
        const result = FolderIcon(childProps) as JSX.Element;
        if (data?.icon && (childProps.expanded || data.always)) {
            result.props.children = <div className={styles.customIcon} style={{backgroundImage: `url(${data.icon})`}}/>;
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

export const ConnectedBetterFolderIcon = ({folderId, ...props}: ConnectedBetterFolderIconProps): JSX.Element => {
    const data = Settings.useSelector(
        (current) => current.folders[folderId],
        [folderId],
        compareFolderData
    );
    return <BetterFolderIcon data={data} {...props}/>;
};
