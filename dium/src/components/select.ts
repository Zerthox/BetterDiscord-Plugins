import * as Finder from "../finder";
import * as Filters from "../filters";
import React from "react";

export interface SelectOption<T> {
    label: React.ReactChild;
    value: T;
}

interface SelectProps<T, O extends SelectOption<T>> {
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

interface SingleSelectProps<T, O extends SelectOption<T>> extends Omit<SelectProps<T, O>, "select" | "isSelected" | "clear"> {
    value: T;
    onChange?: (value: T) => void;
}

interface SelectModule {
    Select: <T, O extends SelectOption<T>>(props: SelectProps<T, O>) => JSX.Element;
    SingleSelect: <T, O extends SelectOption<T>>(props: SingleSelectProps<T, O>) => JSX.Element;
}

export const {Select, SingleSelect}: SelectModule = Finder.demangle({
    Select: Filters.bySource(".renderOptionValue", ".renderOptionLabel"),
    SingleSelect: Filters.bySource(".onChange", ".createElement")
});
