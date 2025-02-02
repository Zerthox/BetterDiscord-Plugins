import {Finder} from "../api";

export interface ClickableProps {
    role?: string;
    tabIndex?: number;
    tag?: string;
    href?: string;
    className?: string;
    onClick?: React.MouseEventHandler;
    onKeyPress?: React.KeyboardEventHandler;
    ignoreKeyPress?: boolean;
    children?: React.ReactNode;
    focusProps?: any;
    innerRef?: React.Ref<any>;
}

export interface Clickable extends React.ComponentClass<ClickableProps, any> {
    contextType: React.Context<any>;
    defaultProps: {
        role: "button";
        tabIndex: 0;
        tag: "div";
    };
}

export const Clickable: Clickable = /* @__PURE__ */ Finder.bySource(["ignoreKeyPress:"], {entries: true});
