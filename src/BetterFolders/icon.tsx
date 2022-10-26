import {React} from "dium";
import {Settings, FolderData} from "./settings";

export interface ConnectedBetterFolderIconProps {
    folderId: number;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

export const ConnectedBetterFolderIcon = ({folderId, ...props}: ConnectedBetterFolderIconProps): JSX.Element => {
    const data = Settings.useCurrent().folders[folderId];
    return <BetterFolderIcon data={data} {...props}/>;
};

export interface BetterFolderIconProps {
    data: FolderData;
    childProps: any;
    FolderIcon: React.FunctionComponent<any>;
}

export const BetterFolderIcon = ({data, childProps, FolderIcon}: BetterFolderIconProps): JSX.Element => {
    if (FolderIcon) {
        const result = FolderIcon(childProps);
        if (data.icon && (childProps.expanded || data.always)) {
            result.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${data.icon})`}}/>;
        }
        return result;
    } else {
        return null;
    }
};
