import { Finder } from "../api";

export const { React } = BdApi;

export const { ReactDOM } = BdApi;

export const ReactSpring: typeof import("@react-spring/web") = /* @__PURE__ */ Finder.byKeys([
    "SpringContext",
    "animated",
]);

export const classNames: typeof import("classnames") = /* @__PURE__ */ Finder.find(
    (exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1,
);

export const EventEmitter: typeof import("node:events") = /* @__PURE__ */ Finder.find(
    (exports) =>
        exports.prototype instanceof Object
        && Object.prototype.hasOwnProperty.call(exports.prototype, "prependOnceListener"),
);

export const lodash: typeof import("lodash") = /* @__PURE__ */ Finder.byKeys(["cloneDeep", "flattenDeep"]);

export const Immutable: typeof import("immutable") = /* @__PURE__ */ Finder.byKeys(["OrderedSet"]);

export const semver: typeof import("semver") = /* @__PURE__ */ Finder.byKeys(["SemVer"]);

export const moment: typeof import("moment") = /* @__PURE__ */ Finder.byKeys(["utc", "months"]);

export const SimpleMarkdown: typeof import("simple-markdown") = /* @__PURE__ */ Finder.byKeys([
    "parseBlock",
    "parseInline",
]);

export const hljs: typeof import("highlight.js").default = /* @__PURE__ */ Finder.byKeys([
    "highlight",
    "highlightBlock",
]);

export const platform: typeof import("platform") = /* @__PURE__ */ Finder.byKeys(["os", "manufacturer"]);

export const lottie: typeof import("lottie-web").default = /* @__PURE__ */ Finder.byKeys(["setSubframeRendering"]);
