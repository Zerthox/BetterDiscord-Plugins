import {Filters, Finder} from "../api";

export const enum FormTags {
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    H4 = "h4",
    H5 = "h5",
    LABEL = "label",
    LEGEND = "legend"
}

interface FormSectionProps {
    children?: React.ReactNode;
    className?: string;
    titleClassName?: string;
    title?: React.ReactNode;
    icon?: any;
    disabled?: boolean;
    htmlFor?: any;
    tag?: string;
}

export interface FormSection extends React.FunctionComponent<FormSectionProps> {
    Tags: typeof FormTags;
}

interface FormItemProps {
    children?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    titleClassName?: string;
    tag?: string;
    required?: boolean;
    style?: React.CSSProperties;
    title?: any;
    error?: any;
}

export interface FormItem extends React.FunctionComponent<FormItemProps> {
    Tags: typeof FormTags;
}

interface FormTitleProps {
    tag?: string;
    children?: React.ReactNode;
    className?: string;
    faded?: boolean;
    disabled?: boolean;
    required?: boolean;
    error?: any;
}

export interface FormTitle extends React.FunctionComponent<FormTitleProps> {
    Tags: typeof FormTags;
}

interface FormTextProps {
    type?: string;
    className?: string;
    disabled?: boolean;
    selectable?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export const enum FormTextTypes {
    INPUT_PLACEHOLDER = "placeholder",
    DESCRIPTION = "description",
    LABEL_BOLD = "labelBold",
    LABEL_SELECTED = "labelSelected",
    LABEL_DESCRIPTOR = "labelDescriptor",
    ERROR = "error",
    SUCCESS = "success"
}

export interface FormText extends React.FunctionComponent<FormTextProps> {
    Types: typeof FormTextTypes;
}

export const enum FormNoticeTypes {
    BRAND = "cardBrand",
    CUSTOM = "card",
    DANGER = "cardDanger",
    PRIMARY = "cardPrimary",
    SUCCESS = "cardSuccess",
    WARNING = "cardWarning"
}

interface FormNoticeProps {
    type?: string;
    imageData?: {
        src: string;
        height?: number;
        width?: number;
        position?: "left" | "right";
    };
    button?: any;
    className?: string;
    iconClassName?: string;
    title?: React.ReactChild;
    body?: React.ReactChild;
    style?: React.CSSProperties;
    align?: string;
}

export interface FormNotice extends React.FunctionComponent<FormNoticeProps> {
    Types: typeof FormNoticeTypes;
}

interface Form {
    FormSection: FormSection;
    FormItem: FormItem;
    FormTitle: FormTitle;
    FormText: FormText;
    FormDivider: React.FunctionComponent<any>;
    FormNotice: FormNotice;
}

export const {
    FormSection,
    FormItem,
    FormTitle,
    FormText,
    FormDivider,
    FormNotice
}: Form = /* @__PURE__ */ Finder.demangle({
    FormSection: Filters.bySource(".titleClassName", ".sectionTitle"),
    FormItem: Filters.bySource(".titleClassName", ".required"),
    FormTitle: Filters.bySource(".faded", ".required"),
    FormText: (target) => target.Types?.INPUT_PLACEHOLDER,
    FormDivider: Filters.bySource(".divider", ".style"),
    FormNotice: Filters.bySource(".imageData", "formNotice")
} as const, ["FormSection", "FormItem", "FormDivider"]);
