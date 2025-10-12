import { Finder } from "../api";
import { Stories } from "./story";

export const FormStories: Stories = /* @__PURE__ */ Finder.byStoryTitle("Form Components");

export const enum FormNoticeTypes {
    BRAND = "cardBrand",
    CUSTOM = "card",
    DANGER = "cardDanger",
    PRIMARY = "cardPrimary",
    SUCCESS = "cardSuccess",
    WARNING = "cardWarning",
}

export interface FormNoticeProps {
    type?: string;
    body?: React.ReactNode;
    title?: React.ReactNode;
    hasButton?: boolean;
    imageData?: {
        src: string;
        height?: number;
        width?: number;
        position?: "left" | "right";
    };
    className?: string;
    iconClassName?: string;
    style?: React.CSSProperties;
    align?: string;
}

export type FormNotice = React.FunctionComponent<FormNoticeProps>;

export const FormNotice: FormNotice = /* @__PURE__ */ Finder.bySource(["imageData:", ".formNotice"], { entries: true });

export const enum FormTags {
    H1 = "h1",
    H2 = "h2",
    H3 = "h3",
    H4 = "h4",
    H5 = "h5",
    LABEL = "label",
    LEGEND = "legend",
}

export interface FormItemProps {
    tag?: string;
    title?: any;
    error?: any;
    disabled?: boolean;
    required?: boolean;
    errorMessage?: any;
    children?: React.ReactNode;
    className?: string;
    titleClassName?: string;
    style?: React.CSSProperties;
}

export type FormItem = React.FunctionComponent<FormItemProps>;

export const FormItem: FormItem = /* @__PURE__ */ Finder.bySource(["titleClassName:", "required:"], { entries: true });

export interface FormSwitchProps {
    checked?: boolean;
    required?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    role?: any;
    layout?: any;
    badge?: any;
    label?: string;
    hideLabel?: boolean;
    icon?: any;
    id?: any;
    errorMessage?: string;
    helperText?: string;
    successMessage?: string;
    description?: string;
    trailingContent?: any;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    focusProps?: any;
    innerRef?: any;
}

export type FormSwitch = React.FunctionComponent<FormSwitchProps>;

export const FormSwitch: FormSwitch = /* @__PURE__ */ Finder.bySource(["onChange:", "innerRef:", '"checkbox"'], {
    entries: true,
});

export interface FormDividerProps {
    className?: string;
    gap?: string | number;
}

export type FormDivider = React.FunctionComponent<FormDividerProps>;

export const FormDivider: FormDivider = /* @__PURE__ */ Finder.bySource(
    [".divider", (source) => /{className:.,gap:.}=/.test(source)],
    {
        entries: true,
    },
);

export interface FormSectionProps {
    children?: React.ReactNode;
    className?: string;
    title?: React.ReactNode;
    disabled?: boolean;
    htmlFor?: any;
    tag?: string;
}

export type FormSection = React.FunctionComponent<FormSectionProps>;

export const FormSection: FormSection = /* @__PURE__ */ Finder.bySource(
    ["children:", "title:", "description:", ".categoryDivider"],
    {
        entries: true,
    },
);

export interface FormTextProps {
    type?: string;
    className?: string;
    disabled?: boolean;
    selectable?: boolean;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export const enum FormTextTypes {
    DEFAULT = "default",
    DESCRIPTION = "description",
}

export type FormText = React.FunctionComponent<FormTextProps>;

export const FormText: FormText = /* @__PURE__ */ Finder.bySource(["type:", "style:", "disabled:", "DEFAULT"], {
    entries: true,
});
