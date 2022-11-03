import {Finder} from "../api";

export interface TextProps {
    variant?: string;
    tag?: any;
    selectable?: boolean;
    className?: string;
    lineClamp?: number;
    color?: string;
    style?: React.CSSProperties;
}

export const Text: React.FunctionComponent<TextProps> = /* @__PURE__ */ Finder.bySource([".lineClamp", ".variant"], {entries: true});
