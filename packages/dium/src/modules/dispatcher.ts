import { Finder } from "../api";
import type { Flux } from ".";

export const Dispatcher: Flux.Dispatcher = /* @__PURE__ */ Finder.byKeys(["dispatch", "subscribe"]);
