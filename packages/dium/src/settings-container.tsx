import { React } from "./modules";
import { Button, Flex, FormDivider } from "./components";
import { confirm } from "./utils";

export interface SettingsContainerProps {
    name: string;
    children?: React.ReactNode;
    onReset?: () => void;
}

export const SettingsContainer = ({ name, children, onReset }: SettingsContainerProps): React.JSX.Element => (
    <div>
        {children}
        {onReset ? (
            <>
                <FormDivider gap={20} />
                <Flex justify={Flex.Justify.END}>
                    <Button
                        size={Button.Sizes.SMALL}
                        onClick={() =>
                            confirm(name, "Reset all settings?", {
                                onConfirm: onReset,
                            })
                        }
                    >
                        Reset
                    </Button>
                </Flex>
            </>
        ) : null}
    </div>
);
