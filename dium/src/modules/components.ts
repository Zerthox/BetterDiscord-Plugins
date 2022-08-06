import * as Finder from "../api/finder";
import {Untyped} from ".";

type UntypedComponent = Untyped<React.ComponentType<any>>;
type StyleModule = Record<string, string>;

export const Flex: UntypedComponent = /* @__PURE__ */ Finder.byName("Flex");
export const Button: UntypedComponent = /* @__PURE__ */ Finder.byProps("Link", "Hovers");
export const Text: UntypedComponent = /* @__PURE__ */ Finder.byName("Text");
export const Links: UntypedComponent = /* @__PURE__ */ Finder.byProps("Link", "NavLink");

export const Switch: UntypedComponent = /* @__PURE__ */ Finder.byName("Switch");
export const SwitchItem: UntypedComponent = /* @__PURE__ */ Finder.byName("SwitchItem");
export const RadioGroup: UntypedComponent = /* @__PURE__ */ Finder.byName("RadioGroup");
export const Slider: UntypedComponent = /* @__PURE__ */ Finder.byName("Slider");
export const TextInput: UntypedComponent = /* @__PURE__ */ Finder.byName("TextInput");

export const Menu: Record<string, UntypedComponent> = /* @__PURE__ */ Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form: Record<string, UntypedComponent> = /* @__PURE__ */ Finder.byProps("FormItem", "FormSection", "FormDivider");

export const margins: StyleModule = /* @__PURE__ */ Finder.byProps("marginLarge");
