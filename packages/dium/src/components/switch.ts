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

export interface SwitchProps {
    id?: any;
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    focusProps?: any;
    innerRef?: any;
}

interface SwitchModule {
    SwitchItem: React.FunctionComponent<SwitchItemProps>;
    Switch: React.FunctionComponent<SwitchProps>;
}

// merged with form, but treat as separate modules in case unmerged
export const {SwitchItem, Switch}: SwitchModule = /* @__PURE__ */ Finder.demangle({
    SwitchItem: Filters.bySource(".tooltipNote"),
    Switch: Filters.byName("withDefaultColorContext()")
});
