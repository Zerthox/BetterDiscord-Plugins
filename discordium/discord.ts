import * as Finder from "./finder";

export const Flex = Finder.byName("Flex");
export const Button = Finder.byProps("Link", "Hovers");
export const Form = Finder.byProps("FormItem", "FormSection", "FormDivider");

export const margins = Finder.byProps("marginLarge");
