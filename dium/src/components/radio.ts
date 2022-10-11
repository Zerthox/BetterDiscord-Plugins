import * as Finder from "../finder";

interface RadioOption<T> {
    name: React.ReactNode;
    value: T;
    desc?: React.ReactNode;
}

interface RadioGroupProps<T> {
    itemInfoClassName?: string;
    itemTitleClassName?: string;
    radioItemClassName?: string;
    className?: string;
    value?: T;
    size?: string;
    onChange?: (option: RadioOption<T>) => void;
    disabled?: boolean;
    options?: RadioOption<T>[];
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

export const RadioGroup: RadioGroup = /* @__PURE__ */ Finder.bySource([".radioItemClassName", ".options"], {entries: true});
