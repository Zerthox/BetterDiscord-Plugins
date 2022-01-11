import * as Finder from "./finder";
import {Flux as FluxTypes, Dispatch as DispatchTypes} from "./types";

// we import instances for the typing
// FIXME: mirror versions!
import ReactInstance from "react";
import ReactDOMInstance from "react-dom";
import classNamesInstance from "classnames";
import lodashInstance from "lodash";
import semverInstance from "semver";
import momentInstance from "moment";
import SimpleMarkdownInstance from "simple-markdown";
import hljsInstance from "highlight.js";
import joiInstance from "joi";
import RavenInstance from "raven";

// NPM DEPENDENCIES
export const EventEmitter: NodeJS.EventEmitter = Finder.byProps("subscribe", "emit");
export const React: typeof ReactInstance = Finder.byProps("createElement", "Component", "Fragment");
export const ReactDOM: typeof ReactDOMInstance = Finder.byProps("render", "findDOMNode", "createPortal");
export const classNames: typeof classNamesInstance = Finder.find((exports: any) => exports instanceof Object && exports.default === exports && Object.keys(exports).length === 1);
export const lodash: typeof lodashInstance = Finder.byProps("cloneDeep", "flattenDeep");
export const semver: typeof semverInstance = Finder.byProps("valid", "satifies");
export const moment: typeof momentInstance = Finder.byProps("utc", "months");
export const SimpleMarkdown: typeof SimpleMarkdownInstance = Finder.byProps("parseBlock", "parseInline");
export const hljs: typeof hljsInstance = Finder.byProps("highlight", "highlightBlock");
export const Raven: typeof RavenInstance = Finder.byProps("captureBreadcrumb");
export const joi: typeof joiInstance = Finder.byProps("assert", "validate", "object");
// TODO: Platform.js

// DISCORD GENERAL
export const Flux: FluxTypes.HookModule = Finder.byProps("Store", "useStateFromStores");
export const Dispatch: DispatchTypes.Module = Finder.query({props: ["default", "Dispatcher"], filter: (exports) => exports instanceof Object && !("ActionBase" in exports)});
export const Events: DispatchTypes.Dispatcher = Dispatch.default;
export const i18n = Finder.byProps("languages", "getLocale");
export const Constants = Finder.byProps("Permissions", "RelationshipTypes");

// DISCORD STORES/ACTIONS
export const Channels = Finder.byProps("getChannel", "hasChannel");
export const SelectedChannel = Finder.query({props: ["getChannelId", "getVoiceChannelId"], export: "default"});
export const Users = Finder.byProps("getUser", "getCurrentUser");
export const Members = Finder.byProps("getMember", "isMember");
export const ContextMenuActions = Finder.byProps("openContextMenuLazy");
export const ModalActions = Finder.byProps("openModalLazy");

// DISCORD COMPONENTS
export const Flex = Finder.byName("Flex");
export const Button = Finder.byProps("Link", "Hovers");
export const Menu = Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form = Finder.byProps("FormItem", "FormSection", "FormDivider");

// DISCORD STYLE MODULES
export const margins = Finder.byProps("marginLarge");
