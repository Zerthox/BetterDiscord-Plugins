import * as Finder from "../finder";

type Handlers = Pick<React.ComponentProps<"button">, "onClick" | "onDoubleClick" | "onMouseDown" | "onMouseUp" | "onMouseEnter" | "onMouseLeave" | "onKeyDown">;

interface ButtonProps extends Handlers {
    look?: string;
    color?: string;
    borderColor?: string;
    hover?: string;
    size?: string;
    fullWidth?: any;
    grow?: any;
    disabled?: boolean;
    submitting?: any;
    type?: any;
    style?: React.CSSProperties;
    wrapperClassName?: string;
    className?: string;
    innerClassName?: string;
    children?: React.ReactNode;
    rel?: any;
    buttonRef?: any;
    focusProps?: any;
    "aria-label"?: string;
    submittingStartedLabel?: any;
    submittingFinishedLabel?: any;
}

export interface Button extends React.FunctionComponent<ButtonProps> {
    Looks: {
        FILLED: string;
        INVERTED: string;
        OUTLINED: string;
        LINK: string;
        BLANK: string;
    };
    Colors: {
        BRAND: string;
        RED: string;
        YELLOW: string;
        GREEN: string;
        PRIMARY: string;
        LINK: string;
        WHITE: string;
        BLACK: string;
        TRANSPARENT: string;
        BRAND_NEW: string;
        CUSTOM: "";
    };
    BorderColors: {
        BRAND: string;
        RED: string;
        GREEN: string;
        YELLOW: string;
        PRIMARY: string;
        LINK: string;
        WHITE: string;
        BLACK: string;
        TRANSPARENT: string;
        BRAND_NEW: string;
    };
    Hovers: {
        DEFAULT: "";
        BRAND: string;
        RED: string;
        GREEN: string;
        YELLOW: string;
        PRIMARY: string;
        LINK: string;
        WHITE: string;
        BLACK: string;
        TRANSPARENT: string;
    };
    Sizes: {
        NONE: "";
        TINY: string;
        SMALL: string;
        MEDIUM: string;
        LARGE: string;
        XLARGE: string;
        MIN: string;
        MAX: string;
        ICON: string;
    };
    Link: React.FunctionComponent<any>;
}

export const Button: Button = /* @__PURE__ */ Finder.byProps(["Colors", "Link"], {entries: true});
