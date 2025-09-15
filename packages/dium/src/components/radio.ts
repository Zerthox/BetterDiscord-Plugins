import { HTMLAttributes } from "react";
import { Filters, Finder } from "../api";

export interface RadioGroupOption<T> {
    name: React.ReactNode;
    value: T;
    desc?: React.ReactNode;
}

export interface RadioGroupProps<T> {
    label?: any;
    description?: any;
    itemInfoClassName?: string;
    itemTitleClassName?: string;
    radioItemClassName?: string;
    collapsibleClassName?: string;
    className?: string;
    value?: T;
    size?: string;
    radioPosition?: any;
    onChange?: (option: RadioGroupOption<T>) => void;
    disabled?: boolean;
    options?: RadioGroupOption<T>[];
    "aria-labelledby"?: any;
    orientation?: any;
    withTransparentBackground?: any;
}

export interface RadioState {
    isSelected: boolean;
    label: any;
}

interface RadioModule {
    RadioGroup<T>(props: RadioGroupProps<T>): React.ReactNode; // only exports small wrapper forwarding props
    getRadioAttributes(state: RadioState): HTMLAttributes<HTMLElement>;
    Sizes?: {
        MEDIUM: string;
        NONE: string;
        NOT_SET: string;
        SMALL: string;
    };
}

export const { RadioGroup, getRadioAttributes }: RadioModule = /* @__PURE__ */ Finder.demangle({
    RadioGroup: Filters.bySource((source) => /{label:.,description:.}=/.test(source)),
    getRadioAttributes: Filters.bySource(`role:"radio"`),
});
