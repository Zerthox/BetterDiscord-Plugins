import {Finder} from "../api";

export interface TextProps {
    variant?: TextVariants;
    tag?: any;
    selectable?: boolean;
    tabularNumbers?: boolean;
    scaleFontToUserSetting?: boolean;
    className?: string;
    lineClamp?: number;
    color?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

type TextVariants =
    "code"
    | "display-lg"
    | "display-md"
    | "display-sm"
    | "eyebrow"
    | "heading-deprecated-12/bold"
    | "heading-deprecated-12/extrabold"
    | "heading-deprecated-12/medium"
    | "heading-deprecated-12/normal"
    | "heading-deprecated-12/semibold"
    | "heading-lg/bold"
    | "heading-lg/extrabold"
    | "heading-lg/medium"
    | "heading-lg/normal"
    | "heading-lg/semibold"
    | "heading-md/bold"
    | "heading-md/extrabold"
    | "heading-md/medium"
    | "heading-md/normal"
    | "heading-md/semibold"
    | "heading-sm/bold"
    | "heading-sm/extrabold"
    | "heading-sm/medium"
    | "heading-sm/normal"
    | "heading-sm/semibold"
    | "heading-xl/bold"
    | "heading-xl/extrabold"
    | "heading-xl/medium"
    | "heading-xl/normal"
    | "heading-xl/semibold"
    | "heading-xxl/bold"
    | "heading-xxl/extrabold"
    | "heading-xxl/medium"
    | "heading-xxl/normal"
    | "heading-xxl/semibold"
    | "text-lg/bold"
    | "text-lg/medium"
    | "text-lg/normal"
    | "text-lg/semibold"
    | "text-md/bold"
    | "text-md/medium"
    | "text-md/normal"
    | "text-md/semibold"
    | "text-sm/bold"
    | "text-sm/medium"
    | "text-sm/normal"
    | "text-sm/semibold"
    | "text-xs/bold"
    | "text-xs/medium"
    | "text-xs/normal"
    | "text-xs/semibold"
    | "text-xxs/bold"
    | "text-xxs/medium"
    | "text-xxs/normal"
    | "text-xxs/semibold";

export const Text: React.FunctionComponent<TextProps> = /* @__PURE__ */ Finder.bySource(["lineClamp:", "variant:", "tabularNumbers:"], {entries: true});
