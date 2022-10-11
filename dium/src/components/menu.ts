import * as Finder from "../finder";
import * as Filters from "../filters";

export const Menu = /* @__PURE__ */ Finder.demangle({
    Root: Filters.bySource(".hideScroller"),
    Separator: "Cl",
    Group: "kS",
    Item: "sN",
    Checkbox: "S8",
    Radio: "k5",
    Control: "II"
}, ["Group"]);
