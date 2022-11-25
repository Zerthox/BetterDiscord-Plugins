import {Finder} from "../api";

export const {React} = BdApi;

export const {ReactDOM} = BdApi;

export const ReactSpring: typeof import("@react-spring/web") = /* @__PURE__ */ Finder.byProps(["SpringContext", "animated"]);

export const classNames: typeof import("classnames") = /* @__PURE__ */ Finder.find(
    (exports) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1
);

export const EventEmitter: typeof import ("node:events") = /* @__PURE__ */ Finder.find(
    (exports) => exports.prototype instanceof Object && Object.prototype.hasOwnProperty.call(exports.prototype, "prependOnceListener")
);

export const lodash: typeof import("lodash") = /* @__PURE__ */ Finder.byProps(["cloneDeep", "flattenDeep"]);

export const Immutable: typeof import("immutable") = /* @__PURE__ */ Finder.byProps(["OrderedSet"]);

export const semver: typeof import("semver") = /* @__PURE__ */ Finder.byProps(["SemVer"]);

export const moment: typeof import("moment") = /* @__PURE__ */ Finder.byProps(["utc", "months"]);

export const SimpleMarkdown: typeof import("simple-markdown") = /* @__PURE__ */ Finder.byProps(["parseBlock", "parseInline"]);

export const hljs: typeof import("highlight.js").default = /* @__PURE__ */ Finder.byProps(["highlight", "highlightBlock"]);

export const platform: typeof import("platform") = /* @__PURE__ */ Finder.byProps(["os", "manufacturer"]);

export const lottie: typeof import("lottie-web").default = /* @__PURE__ */ Finder.byProps(["setSubframeRendering"]);

export const stemmer: typeof import("stemmer").stemmer = /* @__PURE__ */ Finder.bySource([".test", ".exec", ".substr"]);
