import { React } from "dium";
import { GuildsTreeFolder } from "@dium/modules";
import { Flex, Button, FormSwitch, FormText, ImageInput, margins } from "@dium/components";
import { FolderData } from "./settings";
import { renderIcon } from "./icon";

export interface BetterFolderUploaderProps extends FolderData {
    folderNode: GuildsTreeFolder;
    onChange(data: FolderData): void;
}

export const BetterFolderUploader = ({
    icon,
    always,
    showFolderIndicator,
    onChange,
}: BetterFolderUploaderProps): React.JSX.Element => (
    <>
        <Flex align={Flex.Align.CENTER}>
            <Button color={Button.Colors.WHITE} look={Button.Looks.OUTLINED}>
                Upload Image
                <ImageInput
                    onChange={(img: string) =>
                        onChange({ icon: img, always, showFolderIndicator: showFolderIndicator })
                    }
                />
            </Button>
            <FormText type="description" style={{ margin: "0 10px 0 40px" }}>
                Preview:
            </FormText>
            {renderIcon({ icon: icon, always: true, showFolderIndicator: showFolderIndicator })}
        </Flex>
        <FormSwitch
            className={margins.marginTop8}
            checked={always}
            onChange={(checked) => onChange({ icon: icon, always: checked, showFolderIndicator: showFolderIndicator })}
        >
            Always display icon
        </FormSwitch>
        <br />
        <FormSwitch
            className={margins.marginTop8}
            checked={showFolderIndicator}
            onChange={(checked) => onChange({ icon: icon, always: always, showFolderIndicator: checked })}
        >
            Show folder indicator
        </FormSwitch>
    </>
);
