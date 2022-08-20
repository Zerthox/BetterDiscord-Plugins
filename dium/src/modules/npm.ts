import * as Finder from "../api/finder";

// we import instances for the typing
// FIXME: mirror versions!
import type ReactInstance from "react";
import type ReactDOMInstance from "react-dom";
import type ReactSpringInstance from "@react-spring/web";
import type classNamesInstance from "classnames";
import type lodashInstance from "lodash";
import type semverInstance from "semver";
import type momentInstance from "moment";
import type SimpleMarkdownInstance from "simple-markdown";
import type hljsInstance from "highlight.js";
import type platformInstance from "platform";
import type lottieInstance from "lottie-web";

export const EventEmitter: NodeJS.EventEmitter = /* @__PURE__ */ Finder.byProps("subscribe", "emit");

export const React: typeof ReactInstance = /* @__PURE__ */ Finder.byProps("createElement", "Component", "Fragment");

export const ReactDOM: typeof ReactDOMInstance = /* @__PURE__ */ Finder.byProps("render", "findDOMNode", "createPortal");

export const ReactSpring: typeof ReactSpringInstance = /* @__PURE__ */ Finder.byProps("SpringContext", "animated");

export const classNames: typeof classNamesInstance = /* @__PURE__ */ Finder.find((exports: any) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);

export const lodash: typeof lodashInstance = /* @__PURE__ */ Finder.byProps("cloneDeep", "flattenDeep");

export const semver: typeof semverInstance = /* @__PURE__ */ Finder.byProps("SemVer");

export const moment: typeof momentInstance = /* @__PURE__ */ Finder.byProps("utc", "months");

export const SimpleMarkdown: typeof SimpleMarkdownInstance = /* @__PURE__ */ Finder.byProps("parseBlock", "parseInline");

export const hljs: typeof hljsInstance = /* @__PURE__ */ Finder.byProps("highlight", "highlightBlock");

export const platform: typeof platformInstance = /* @__PURE__ */ Finder.byProps("os", "manufacturer");

export const lottie: typeof lottieInstance = /* @__PURE__ */ Finder.byProps("setSubframeRendering");

// joi & raven seem to have been removed
