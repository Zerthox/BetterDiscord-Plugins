import {Common} from "./common";

export interface RadioGroupOption<T> {
    name: React.ReactNode;
    value: T;
    desc?: React.ReactNode;
}

export interface RadioGroupProps<T> {
    itemInfoClassName?: string;
    itemTitleClassName?: string;
    radioItemClassName?: string;
    className?: string;
    value?: T;
    size?: string;
    onChange?: (option: RadioGroupOption<T>) => void;
    disabled?: boolean;
    options?: RadioGroupOption<T>[];
    "aria-labelledby"?: any;
    orientation?: any;
    withTransparentBackground?: any;
}

export interface RadioGroup {
    <T>(props: RadioGroupProps<T>): JSX.Element;
    Sizes: {
        MEDIUM: string;
        NONE: string;
        NOT_SET: string;
        SMALL: string;
    };
}

export const RadioGroup: RadioGroup = Common.RadioGroup;
