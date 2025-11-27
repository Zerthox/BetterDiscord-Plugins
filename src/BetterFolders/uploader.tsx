import { React } from "dium";
import { GuildsTreeFolder } from "@dium/modules";
import { Flex, Button, FormSwitch, FormText, ImageInput, margins, FormItem } from "@dium/components";
import { FolderData, Settings } from "./settings";
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
            {renderIcon(
                { icon: icon, always: true, showFolderIndicator: showFolderIndicator },
                Settings.current.folderIndicatorPosition,
            )}
        </Flex>
        <FormItem className={margins.marginTop20}>
            <FormSwitch
                checked={always}
                onChange={(checked) =>
                    onChange({ icon: icon, always: checked, showFolderIndicator: showFolderIndicator })
                }
                label="Always display icon"
            />
            <FormSwitch
                checked={showFolderIndicator}
                onChange={(checked) => onChange({ icon: icon, always: always, showFolderIndicator: checked })}
                label="Show folder indicator"
            />
        </FormItem>
    </>
);
