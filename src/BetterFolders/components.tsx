import {Finder, React, Modules} from "dium";

const {Flex, Button, SwitchItem} = Modules;
const {FormText} = Modules.Form;
const ImageInput = Finder.byName("ImageInput");

const {margins} = Modules;

export interface FolderData {
    icon: string;
    always: boolean;
}

export interface BetterFolderIconProps extends FolderData {
    childProps: any;
    FolderIcon(props: any): JSX.Element;
}

export const BetterFolderIcon = ({icon, always, childProps, FolderIcon}: BetterFolderIconProps): JSX.Element => {
    const result = FolderIcon(childProps);
    if (icon && (childProps.expanded || always)) {
        result.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon})`}}/>;
    }
    return result;
};

export interface GuildNode {
    type: "guild";
    id: number;
    parentId: number;
    unavailable: boolean;
}

export interface FolderNode {
    type: "folder";
    id: number;
    color: number;
    name: string;
    children: GuildNode[];
    muteConfig?: any;
    expanded: boolean;
}

export type TreeNode = GuildNode | FolderNode;

export interface BetterFolderUploaderProps extends FolderData {
    folderNode: FolderNode;
    onChange(data: FolderData): void;
    FolderIcon(props: any): JSX.Element;
}

export const BetterFolderUploader = ({icon, always, folderNode, onChange, FolderIcon}: BetterFolderUploaderProps): JSX.Element => (
    <>
        <Flex align={Flex.Align.CENTER}>
            <Button color={Button.Colors.WHITE} look={Button.Looks.OUTLINED}>
                Upload Image
                <ImageInput onChange={(img: string) => onChange({icon: img, always})}/>
            </Button>
            <FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</FormText>
            <BetterFolderIcon
                icon={icon}
                always
                childProps={{expanded: false, folderNode}}
                FolderIcon={FolderIcon}
            />
        </Flex>
        <SwitchItem
            hideBorder
            className={margins.marginTop8}
            value={always}
            onChange={(checked: boolean) => onChange({icon, always: checked})}
        >Always display icon</SwitchItem>
    </>
);
