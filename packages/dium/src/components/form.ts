import { Finder } from "../api";
import { Stories } from "./story";

export const FormStories: Stories = /* @__PURE__ */ Finder.byStoryTitle("Form Components");

export type FormNoticeType = "BRAND" | "CUSTOM" | "DANGER" | "PRIMARY" | "SUCCESS" | "WARNING";

export interface FormNoticeProps {
    type?: string;
    body?: React.ReactNode;
    title?: React.ReactNode;
    button?: any;
    imageData?: any;
    className?: string;
    iconClassName?: string;
    style?: React.CSSProperties;
    align?: string;
}

export interface FormNotice extends React.FunctionComponent<FormNoticeProps> {
    Types: Record<FormNoticeType, string>;
}

export const FormNotice: FormNotice = /* @__PURE__ */ Finder.bySource(["imageData:", "button:"], { entries: true });

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

export interface FormTitleProps {
    type?: string;
    title: string;
    titleTrailingIcon?: any;
    subtitle?: string;
}

export type FormTitle = React.FunctionComponent<FormTitleProps>;

export const FormTitle: FormTitle = /* @__PURE__ */ Finder.bySource(["titleTrailingIcon:", "type:"], {
    entries: true,
});

export interface FormControlProps {
    id?: any;
    errorMessage?: string;
    helperText?: string;
    successMessage?: string;
    description?: string;
    label?: string;
    hideLabel?: boolean;
    required?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    role?: string;
    layout?: string;
    layoutConfig?: any;
    badge?: any;
    icon?: any;
    interactiveLabel?: boolean;
    auxiliaryContentPosition?: string;
    trailingAuxiliaryContent?: any;
    ref?: any;
}

export interface FormSwitchProps extends Omit<
    FormControlProps,
    "disabled" | "layoutConfig" | "trailingAuxiliaryContent" | "children"
> {
    checked?: boolean;
    required?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
    focusProp?: any;
    innerRef?: any;
}

export type FormSwitch = React.FunctionComponent<FormSwitchProps>;

export const FormSwitch: FormSwitch = /* @__PURE__ */ Finder.bySource(["checked:", "innerRef:", "layout:"], {
    entries: true,
});

export interface FormDividerProps {
    className?: string;
    gap?: string | number;
}

export type FormDivider = React.FunctionComponent<FormDividerProps>;

export const FormDivider: FormDivider = /* @__PURE__ */ Finder.bySource(
    ["marginTop:", (source) => /{className:.,gap:.}=/.test(source)],
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

export const FormSection: FormSection = /* @__PURE__ */ Finder.bySource(["children:", "title:", "description:"], {
    entries: true,
});

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

export const FormText: FormText = /* @__PURE__ */ Finder.bySource(
    ["type:", "style:", "disabled:", "variant:", ".DEFAULT"],
    {
        entries: true,
    },
);
