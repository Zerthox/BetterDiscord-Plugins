import Finder from "./finder";

export const EventEmitter: NodeJS.EventEmitter = Finder.byProps("subscribe", "emit");

export const React = Finder.byProps("createElement", "Component", "Fragment");

export const ReactDOM = Finder.byProps("render", "findDOMNode", "createPortal");

export const classNames = Finder.find((exports) => exports.default === exports && Object.keys(exports).length === 1);

export const Flux = Finder.query({props: ["Store", "connectStores"], export: "default"});

export const Dispatcher = Finder.query({props: ["Dispatcher"], export: "Dispatcher"});

export const lodash = Finder.byProps("cloneDeep", "flattenDeep");

export const semver = Finder.byProps("valid", "satifies");

export const moment = Finder.byProps("utc", "months");

export const SimpleMarkdown = Finder.byProps("parseBlock", "parseInline");

export const hljs = Finder.byProps("highlight", "highlightBlock");

export const Raven = Finder.byProps("captureBreadcrumb");

export const joi = Finder.byProps("assert", "validate", "object");

export const i18n = Finder.byProps("languages", "getLocale");
