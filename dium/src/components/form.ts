import React from "react";
import * as Finder from "../finder";

// TODO: module also has "form notice"...?

export const enum FormTag {
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
    Tags: typeof FormTag;
}

export const FormSection: FormSection = /* @__PURE__ */ Finder.bySource([".titleClassName", ".sectionTitle"]);

interface FormItemProps {
    children?: React.ReactNode;
    disabled?: boolean;
    className?: string;
    titleClassName?: string;
    tag?: string;
    required?: boolean;
    style?: any;
    title?: any;
    error?: any;
}

export interface FormItem extends React.FunctionComponent<FormItemProps> {
    Tags: typeof FormTag;
}

export const FormItem: FormItem = /* @__PURE__ */ Finder.bySource([".titleClassName", ".required"]);

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
    Tags: typeof FormTag;
}

export const FormTitle: FormTitle = /* @__PURE__ */ Finder.bySource([".faded", ".required"]);

interface FormTextProps {
    type?: string;
    className?: string;
    disabled?: boolean;
    selectable?: boolean;
    children?: React.ReactNode;
    style?: any;
}

export const enum FormTextType {
    INPUT_PLACEHOLDER = "placeholder",
    DESCRIPTION = "description",
    LABEL_BOLD = "labelBold",
    LABEL_SELECTED = "labelSelected",
    LABEL_DESCRIPTOR = "labelDescriptor",
    ERROR = "error",
    SUCCESS = "success"
}

export interface FormText extends React.FunctionComponent<FormTextProps> {
    Types: typeof FormTextType;
}

export const FormText: FormText = /* @__PURE__ */ Finder.find((target) => target.Types?.INPUT_PLACEHOLDER);

export const FormDivider: React.FunctionComponent<any> = /* @__PURE__ */ Finder.bySource([".divider", ".style", "\"div\""]);
