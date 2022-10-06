import * as Finder from "../api/finder";

export const EventEmitter: NodeJS.EventEmitter = /* @__PURE__ */ Finder.byProps("subscribe", "emit");

export const React: typeof import("react") = /* @__PURE__ */ BdApi.React;

export const ReactDOM: typeof import("react-dom") = /* @__PURE__ */ BdApi.ReactDOM;

export const ReactSpring: typeof import("@react-spring/web") = /* @__PURE__ */ Finder.byProps("SpringContext", "animated");

export const classNames: typeof import("classnames") = /* @__PURE__ */ Finder.find(
    (exports: any) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1
);

export const lodash: typeof import("lodash") = /* @__PURE__ */ Finder.byProps("cloneDeep", "flattenDeep");

export const semver: typeof import("semver") = /* @__PURE__ */ Finder.byProps("SemVer");

export const moment: typeof import("moment") = /* @__PURE__ */ Finder.byProps("utc", "months");

export const SimpleMarkdown: typeof import("simple-markdown") = /* @__PURE__ */ Finder.byProps("parseBlock", "parseInline");

export const hljs: typeof import("highlight.js") = /* @__PURE__ */ Finder.byProps("highlight", "highlightBlock");

export const platform: typeof import("platform") = /* @__PURE__ */ Finder.byProps("os", "manufacturer");

export const lottie: typeof import("lottie-web") = /* @__PURE__ */ Finder.byProps("setSubframeRendering");

// joi & raven seem to have been removed
