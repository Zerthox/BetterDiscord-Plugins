import * as Finder from "../finder";

export * from "./flex";
export * from "./button";
export * from "./form";
export * from "./menu";
export * from "./radio";
export * from "./slider";
export * from "./switch";
export * from "./text-input";
export * from "./text";

export const Clickable: React.ComponentClass<any, any> = /* @__PURE__ */ Finder.byName("Clickable");
export const Links: Record<string, React.ComponentType<any>> = /* @__PURE__ */ Finder.byProps(["Link", "NavLink"]);

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
