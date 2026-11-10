import { Finder } from "../api";
import { React } from "../modules";
import { Switch } from "./switch";

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
    title: string;
    subtitle?: string;
    decoration?: any;
    subtitleDecoration?: any;
    persistentBadge?: any;
}

export type FormTitle = React.FunctionComponent<FormTitleProps>;

export interface FormControlRenderProps {
    controlId: string;
    labelId: string;
    describedById: string;
    errorMessageId: string;
}

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
    children?: React.ReactNode | ((props: FormControlRenderProps) => React.ReactNode);
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

export type FormControl = React.FunctionComponent<FormControlProps>;

export const FormControl: FormControl = /* @__PURE__ */ Finder.bySource(
    ["interactiveLabel:", "auxiliaryContentPosition:"],
    { entries: true },
);

export interface FormSwitchProps extends Omit<
    FormControlProps,
    "disabled" | "layoutConfig" | "trailingAuxiliaryContent" | "children"
> {
    checked?: boolean;
    displayOnly?: boolean;
    onChange?: (checked: boolean) => void;
    focusProp?: any;
    hasIcon?: boolean;
}

export type FormSwitch = React.FunctionComponent<FormSwitchProps>;

/**
 * Discord no longer ships a standalone form switch component.
 * Compose it from the generic form control and the bare switch instead.
 */
export const FormSwitch: FormSwitch = ({
    checked,
    onChange,
    displayOnly,
    hasIcon,
    focusProp,
    layout = "horizontal",
    ...props
}: FormSwitchProps): React.JSX.Element => (
    <FormControl {...props} layout={layout}>
        {({ controlId, labelId, describedById }) => (
            <Switch
                id={controlId}
                checked={checked}
                onChange={onChange}
                displayOnly={displayOnly}
                hasIcon={hasIcon}
                focusProps={focusProp}
                labelledBy={labelId}
                describedBy={describedById}
            />
        )}
    </FormControl>
);

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
