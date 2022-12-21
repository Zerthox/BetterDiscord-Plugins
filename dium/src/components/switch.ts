import {Filters, Finder} from "../api";

export interface SwitchItemProps {
    value?: boolean;
    disabled?: boolean;
    hideBorder?: boolean;
    tooltipNote?: any;
    onChange?: (checked: boolean) => void;
    className?: string;
    style?: React.CSSProperties;
    note?: any;
    helpdeskArticleId?: any;
    children?: React.ReactNode;
}

export const SwitchItem: React.FunctionComponent<SwitchItemProps> = /* @__PURE__ */ Finder.bySource([".helpdeskArticleId"], {entries: true});

export interface SwitchProps {
    id?: any;
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    focusProps?: any;
    innerRef?: any;
}

export const Switch: React.FunctionComponent<SwitchProps> = /* @__PURE__ */ Finder.find(Filters.join(
    Filters.byName("withDefaultColorContext()"),
    (_, module) => Object.keys(module.exports).length === 1
));
