import {Finder} from "../api";

type CommonComponents = Record<string, any>;

export const Common: CommonComponents = /* @__PURE__ */ Finder.byKeys(["Button", "Switch", "Select"]);
