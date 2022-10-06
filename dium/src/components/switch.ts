import React from "react";
import * as Finder from "../api/finder";

interface SwitchItemProps {
    value: boolean;
    disabled?: boolean;
    hideBorder?: boolean;
    tooltipNote?: any;
    onChange?: (checked: boolean) => void;
    className?: string;
    style?: any;
    note?: any;
    helpdeskArticleId?: any;
    children?: React.ReactNode;
}

export const SwitchItem: React.FunctionComponent<SwitchItemProps> = /* @__PURE__ */ Finder.bySource(".helpdeskArticleId");

interface SwitchProps {
    id?: any;
    onChange?: (checked: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    focusProps?: any;
    innerRef?: any;
}

export const Switch: React.FunctionComponent<SwitchProps> = /* @__PURE__ */ Finder.bySource(".onChange", ".focusProps");
