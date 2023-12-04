import {React} from "dium";
import {GuildsTreeFolder} from "@dium/modules";
import {Flex, Button, FormSwitch, FormText, ImageInput, margins} from "@dium/components";
import {FolderData} from "./settings";
import {BetterFolderIcon} from "./icon";

export interface BetterFolderUploaderProps extends FolderData {
    folderNode: GuildsTreeFolder;
    onChange(data: FolderData): void;
    FolderIcon: React.FunctionComponent<any>;
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
                data={{icon, always: true}}
                childProps={{expanded: false, folderNode}}
                FolderIcon={FolderIcon}
            />
        </Flex>
        <FormSwitch
            hideBorder
            className={margins.marginTop8}
            value={always}
            onChange={(checked) => onChange({icon, always: checked})}
        >Always display icon</FormSwitch>
    </>
);
