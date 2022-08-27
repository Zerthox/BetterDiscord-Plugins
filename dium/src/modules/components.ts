import * as Finder from "../api/finder";
import {Untyped} from ".";

// TODO: split components from modules?

type UntypedComponent = Untyped<React.ComponentType<any>>;

export const Flex: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("Flex");
export const Button: UntypedComponent = /* @__PURE__ */ Finder.byProps("Link", "Hovers");
export const Text: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("Text");
export const Links: UntypedComponent = /* @__PURE__ */ Finder.byProps("Link", "NavLink");

export const Switch: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("Switch");
export const SwitchItem: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("SwitchItem");
export const RadioGroup: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("RadioGroup");
export const Slider: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("Slider");
export const TextInput: UntypedComponent = /* @__PURE__ */ Finder.byAnyName("TextInput");

export const Menu: Record<string, UntypedComponent> = /* @__PURE__ */ Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form: Record<string, UntypedComponent> = /* @__PURE__ */ Finder.byProps("FormItem", "FormSection", "FormDivider");

interface Margins {
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
    marginXLarge: "60px";
    marginLarge: "40px";
    marginMedium: "20px";
    marginSmall: "8px";
    marginXSmall: "4px";
}
export const margins: Margins = /* @__PURE__ */ Finder.byProps("marginLarge");
