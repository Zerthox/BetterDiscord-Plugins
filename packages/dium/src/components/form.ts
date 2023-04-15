import {Common} from "./common";

export const enum FormTags {
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    H4 = "h4",
    H5 = "h5",
    LABEL = "label",
    LEGEND = "legend"
}

export interface FormSectionProps {
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

export interface FormItemProps {
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

export interface FormTitleProps {
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

export interface FormTextProps {
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

export interface FormSwitchProps {
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

export const enum FormNoticeTypes {
    BRAND = "cardBrand",
    CUSTOM = "card",
    DANGER = "cardDanger",
    PRIMARY = "cardPrimary",
    SUCCESS = "cardSuccess",
    WARNING = "cardWarning"
}

export interface FormNoticeProps {
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
    title?: React.ReactNode;
    body?: React.ReactNode;
    style?: React.CSSProperties;
    align?: string;
}

export interface FormNotice extends React.FunctionComponent<FormNoticeProps> {
    Types: typeof FormNoticeTypes;
}

interface FormComponents {
    FormSection: FormSection;
    FormItem: FormItem;
    FormTitle: FormTitle;
    FormText: FormText;
    FormLabel: React.FunctionComponent<any>;
    FormDivider: React.FunctionComponent<any>;
    FormSwitch: React.FunctionComponent<FormSwitchProps>;
    FormNotice: FormNotice;
}

export const {
    FormSection,
    FormItem,
    FormTitle,
    FormText,
    FormLabel,
    FormDivider,
    FormSwitch,
    FormNotice
} = Common as FormComponents;
