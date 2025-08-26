import {Finder} from "../api";

export const enum TextInputSizes {
    DEFAULT = "default",
    MINI = "mini"
}

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
    disabled?: boolean;
    editable?: boolean;
    inputRef?: React.Ref<HTMLInputElement>;
    focusProps?: any;
    name?: string;
    placeholder?: string;
    maxLength?: number;
    value?: string;
    defaultValue?: string;
    minLength?: number;
    error?: any;
    defaultDirty?: boolean;
    leading?: any;
    trailing?: any;
    validateOn?: any;
    size?: string;
    fullWidth?: boolean;
    clearable?: boolean;
    helperText?: string;
    showCharacterCount?: boolean;
    successMessage?: any;
    onChange?: (value: string, name: string) => void;
}

export const TextInput: React.ComponentClass<TextInputProps, any> = /* @__PURE__ */ Finder.bySource(["placeholder", "maxLength", "clearable"], {entries: true});

export const ImageInput: React.ComponentClass<any> = /* @__PURE__ */ Finder.find(
    (target) => typeof target.defaultProps?.multiple === "boolean" && typeof target.defaultProps?.maxFileSizeBytes === "number"
);
