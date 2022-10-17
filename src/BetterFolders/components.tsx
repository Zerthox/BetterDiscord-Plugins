import {Finder, React} from "dium";
import {GuildsTreeFolder} from "@dium/modules";
import {Flex, Button, SwitchItem, FormText, margins} from "@dium/components";

const ImageInput: React.ComponentClass<any> = Finder.find(
    (target) => typeof target.defaultProps?.multiple === "boolean" && typeof target.defaultProps?.maxFileSizeBytes === "number"
);

export interface FolderData {
    icon: string;
    always: boolean;
}

export interface BetterFolderIconProps extends FolderData {
    childProps: any;
    FolderIcon(props: any): JSX.Element;
}

export const BetterFolderIcon = ({icon, always, childProps, FolderIcon}: BetterFolderIconProps): JSX.Element => {
    if (FolderIcon) {
        const result = FolderIcon(childProps);
        if (icon && (childProps.expanded || always)) {
            result.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon})`}}/>;
        }
        return result;
    } else {
        return null;
    }
};

export interface BetterFolderUploaderProps extends FolderData {
    folderNode: GuildsTreeFolder;
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
            onChange={(checked) => onChange({icon, always: checked})}
        >Always display icon</SwitchItem>
    </>
);
