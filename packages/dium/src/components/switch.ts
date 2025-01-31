import {Finder} from "../api";

export interface SwitchProps {
    id?: any;
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    focusProps?: any;
    innerRef?: any;
}

export const Switch: React.FunctionComponent<SwitchProps> = /* @__PURE__ */ Finder.bySource(["checked:", "reducedMotion:"], {entries: true});
