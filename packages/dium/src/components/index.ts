import {Finder} from "../api";

export * from "./button";
export * from "./clickable";
export * from "./common";
export * from "./embed";
export * from "./flex";
export * from "./form";
export * from "./guild";
export * from "./link";
export * from "./menu";
export * from "./message";
export * from "./radio";
export * from "./select";
export * from "./slider";
export * from "./switch";
export * from "./text-area";
export * from "./input";
export * from "./text";

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

export const margins: Margins = /* @__PURE__ */ Finder.byKeys(["marginLarge"]);
