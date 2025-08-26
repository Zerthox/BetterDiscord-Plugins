import { Finder } from "../api";

export interface IconArrowProps extends Record<string, any> {
    width?: number;
    height?: number;
    color?: string;
    colorClass?: string;
}

// chevron small down icon
export const IconArrow: React.FunctionComponent<IconArrowProps> = /* @__PURE__ */ Finder.bySource(['d:"M5.3 9.'], {
    entries: true,
});
