import {React} from "dium";
import {GuildsTreeFolder} from "@dium/modules";
import {Flex, Button, FormSwitch, FormText, ImageInput, margins} from "@dium/components";
import {FolderData} from "./settings";
import {renderIcon} from "./icon";

export interface BetterFolderUploaderProps extends FolderData {
    folderNode: GuildsTreeFolder;
    onChange(data: FolderData): void;
}

export const BetterFolderUploader = ({icon, always, onChange}: BetterFolderUploaderProps): JSX.Element => (
    <>
        <Flex align={Flex.Align.CENTER}>
            <Button color={Button.Colors.WHITE} look={Button.Looks.OUTLINED}>
                Upload Image
                <ImageInput onChange={(img: string) => onChange({icon: img, always})}/>
            </Button>
            <FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</FormText>
            {renderIcon({icon, always: true})}
        </Flex>
        <FormSwitch
            hideBorder
            className={margins.marginTop8}
            value={always}
            onChange={(checked) => onChange({icon, always: checked})}
        >Always display icon</FormSwitch>
    </>
);
