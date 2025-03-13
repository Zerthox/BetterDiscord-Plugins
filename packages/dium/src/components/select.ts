import {Finder, Filters} from "../api";

export interface SelectOption<T> {
    label: React.ReactNode;
    value: T;
}

export interface SelectProps<T, O extends SelectOption<T>> {
    options: O[];
    placeholder?: any;
    className?: string;
    isDisabled?: boolean;
    maxVisibleItems?: any;
    look?: any;
    autoFocus?: any;
    popoutWidth?: any;
    clearable?: boolean;
    onClose?: (...args: any) => void;
    onOpen?: (...args: any) => void;
    renderOptionLabel?: (option: O) => JSX.Element;
    renderOptionValue?: (option: O[]) => JSX.Element;
    popoutClassName?: string;
    popoutPosition?: any;
    optionClassName?: string;
    closeOnSelect?: any;
    select?: (value: T) => void;
    isSelected?: (value: T) => boolean;
    clear?: () => void;
    serialize?: (value: T) => string;
    hideIcon?: boolean;
    "aria-label"?: any;
    "aria-labelledby"?: any;
}

export interface SingleSelectProps<T, O extends SelectOption<T>> extends Omit<SelectProps<T, O>, "select" | "isSelected" | "clear"> {
    value: T;
    onChange?: (value: T) => void;
}

interface SelectComponents {
    Select: <T, O extends SelectOption<T>>(props: SelectProps<T, O>) => JSX.Element;
    SingleSelect: <T, O extends SelectOption<T>>(props: SingleSelectProps<T, O>) => JSX.Element;
}

export const {Select, SingleSelect}: SelectComponents = /* @__PURE */ Finder.demangle({
    Select: Filters.bySource("renderOptionLabel:", "renderOptionValue:", "popoutWidth:"),
    SingleSelect: Filters.bySource((source) => /{value:[a-zA-Z_$],onChange:[a-zA-Z_$]}/.test(source))
}, ["Select"]);
