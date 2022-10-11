import * as Finder from "../finder";
import {Untyped} from "../modules";

export * from "./flex";
export * from "./button";
export * from "./form";
export * from "./radio";
export * from "./switch";
export * from "./text";

type UntypedComponent = Untyped<React.ComponentType<any>>;

export const Clickable: React.ComponentClass<any, any> = /* @__PURE__ */ Finder.byName("Clickable");
export const Links: UntypedComponent = /* @__PURE__ */ Finder.byProps(["Link", "NavLink"]);

export const Slider: UntypedComponent = /* @__PURE__ */ Finder.byName("Slider");
export const TextInput: UntypedComponent = /* @__PURE__ */ Finder.byName("TextInput");

export const Menu: Record<string, UntypedComponent> = /* @__PURE__ */ Finder.byProps(["MenuGroup", "MenuItem", "MenuSeparator"]);

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

export const margins: Margins = /* @__PURE__ */ Finder.byProps(["marginLarge"]);
