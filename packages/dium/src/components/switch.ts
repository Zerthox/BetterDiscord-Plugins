import {Common} from "./common";

export interface SwitchProps {
    id?: any;
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    focusProps?: any;
    innerRef?: any;
}

export const Switch: React.FunctionComponent<SwitchProps> = Common.Switch;
