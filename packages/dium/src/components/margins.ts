import { Finder } from "../api";

export interface Margins {
    marginBottom4: string;
    marginBottom8: string;
    marginBottom20: string;
    marginBottom40: string;
    marginBottom60: string;
    marginCenterHorz: string;
    marginLeft8: string;
    marginReset: string;
    marginTop4: string;
    marginTop8: string;
    marginTop20: string;
    marginTop40: string;
    marginTop60: string;
}

const marginNames: (keyof Margins)[] = [
    "marginBottom4",
    "marginBottom8",
    "marginBottom20",
    "marginBottom40",
    "marginBottom60",
    "marginCenterHorz",
    "marginLeft8",
    "marginReset",
    "marginTop4",
    "marginTop8",
    "marginTop20",
    "marginTop40",
    "marginTop60",
];

/** Matches a class name starting with the given name, e.g. `marginTop4_abc123` but not `marginTop40_abc123`. */
const byClassName =
    (name: string) =>
    (value: unknown): boolean =>
        typeof value === "string" && value.startsWith(name) && !/^[A-Za-z0-9]/.test(value.slice(name.length));

// export keys are mangled, so match by class name values instead
export const margins: Margins = /* @__PURE__ */ Finder.demangle(
    Object.fromEntries(marginNames.map((name) => [name, byClassName(name)])) as Record<
        keyof Margins,
        (value: unknown) => boolean
    >,
    ["marginBottom40", "marginTop4"],
);
