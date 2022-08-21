import * as Finder from "../api/finder";
import {Untyped} from ".";

// TODO: split components from modules?

type UntypedComponent = Untyped<React.ComponentType<any>>;
type StyleModule = Record<string, string>;

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

export const margins: StyleModule = /* @__PURE__ */ Finder.byProps("marginLarge");
