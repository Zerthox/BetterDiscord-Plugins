import {React, classNames, Flex, Button, Form, margins} from "../modules";
import {confirm} from "../utils";

export interface SettingsContainerProps {
    name: string;
    children?: React.ReactNode;
    onReset: () => void;
}

export const SettingsContainer = ({name, children, onReset}: SettingsContainerProps) => (
    <Form.FormSection>
        {children}
        <Form.FormDivider className={classNames(margins.marginTop20, margins.marginBottom20)}/>
        <Flex justify={Flex.Justify.END}>
            <Button
                size={Button.Sizes.SMALL}
                onClick={() => confirm(name, "Reset all settings?", {
                    onConfirm: () => onReset()
                })}
            >Reset</Button>
        </Flex>
    </Form.FormSection>
);
