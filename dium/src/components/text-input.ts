import {Filters, Finder} from "../api";

export const enum TextInputSizes {
    DEFAULT = "default",
    MINI = "mini"
}

export interface TextInputProps {
    type?: string;
    value?: string;
    name?: string;
    placeholder?: string;
    error?: any;
    minLength?: any;
    maxLength?: any;
    onChange: (value: string) => void;
    className?: string;
    inputClassName?: string;
    inputPrefix?: any;
    disabled?: boolean;
    size?: string;
    editable?: boolean;
    autoFocus?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    prefixElement?: any;
    focusProps?: any;
    titleId?: any;
    "aria-labelledby"?: any;
}

export interface TextInput extends React.ComponentClass<TextInputProps, any> {
    Sizes: typeof TextInputSizes;
    contextType: React.Context<any>;
    defaultProps: {
        name: "";
        size: "default";
        disabled: false;
        type: "text";
        placeholder: "";
        autoFocus: false;
        maxLength: 999;
    };
}

interface TextInputModule {
    TextInput: TextInput;
    TextInputError: React.FunctionComponent<any>;
}

export const {TextInput, TextInputError}: TextInputModule = /* @__PURE__ */ Finder.demangle({
    TextInput: (target) => target?.defaultProps?.type === "text",
    TextInputError: Filters.bySource(".error", "text-danger")
} as const, ["TextInput"]);
