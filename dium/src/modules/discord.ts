/* eslint-disable spaced-comment */

import * as Finder from "../api/finder";
import type {Untyped, UntypedComponent, StyleModule} from ".";
import type {Store} from "./flux";
import type {Discord} from "../api";

// GENERAL
export const Constants: any = /*@__PURE__*/ Finder.byProps("Permissions", "RelationshipTypes");
export const i18n: any = /*@__PURE__*/ Finder.byProps("languages", "getLocale");
export const Platforms: any = /*@__PURE__*/ Finder.byProps("getPlatform", "isWindows", "isWeb", "PlatformTypes");

// STORES/ACTIONS
export const ClientActions: any = /*@__PURE__*/ Finder.byProps("toggleGuildFolderExpand");

export const GuildStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getGuild");
export const GuildActions: any = /*@__PURE__*/ Finder.byProps("requestMembers");

export const ChannelStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getChannel", "hasChannel");
export const ChannelActions: any = /*@__PURE__*/ Finder.byProps("selectChannel");
export const SelectedChannelStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getChannelId", "getVoiceChannelId");

export const UserStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getUser", "getCurrentUser");
export const GuildMemberStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getMember", "isMember");
export const PresenceStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getState", "getStatus", "isMobileOnline");
export const RelationshipStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("isFriend", "getRelationshipCount");

export const MessageStore: Untyped<Store> = /*@__PURE__*/ Finder.byProps("getMessage", "getMessages");
export const MessageActions: any = /*@__PURE__*/ Finder.byProps("jumpToMessage", "_sendMessage");

export type MediaEngineContext = any;

export interface MediaEngineStore extends Untyped<Store> {
    getMediaEngine(): any;
    getLocalPan(userId: Discord.Snowflake, context?: MediaEngineContext): {left: number; right: number};
    getLocalVolume(userId: Discord.Snowflake, context?: MediaEngineContext): number;
    getLoopback(): boolean;
    getNoiseCancellation(): boolean;
    getNoiseSuppression(): boolean;
    isDeaf(): boolean;
    isMute(): boolean;
    isSelfDeaf(context?: MediaEngineContext): boolean;
    isSelfMute(context?: MediaEngineContext): boolean;
}
export const MediaEngineStore: MediaEngineStore = /*@__PURE__*/ Finder.byProps("getLocalVolume");

export interface MediaEngineActions extends Record<string, any> {
    setLocalPan(userId: Discord.Snowflake, left: number, right: number, context?: MediaEngineContext): void;
    setLocalVolume(userId: Discord.Snowflake, volume: number, context?: MediaEngineContext): void;
    setLoopback(enabled: boolean): void;
    setNoiseCancellation(enabled: boolean, location: any): void;
    setNoiseSuppression(enabled: boolean, location: any): void;
    toggleSelfDeaf(options?: {context: MediaEngineContext; syncRemove: any}): void;
    toggleSelfMute(options?: {context: MediaEngineContext; syncRemove: any}): Promise<void>;
    setTemporarySelfMute(mute: any): void;
    toggleLocalMute(userId: Discord.Snowflake, context?: MediaEngineContext): void;
}
export const MediaEngineActions: MediaEngineActions = /*@__PURE__*/ Finder.byProps("setLocalVolume");

export interface ContextMenuActions {
    openContextMenu(e: any, t: any, n: any, r: any): any;
    openContextMenuLazy(event: React.MouseEvent, resolver: (...args: any[]) => Promise<any>, unknown: any): any;
    closeContextMenu(): any;
}
export const ContextMenuActions: ContextMenuActions = /*@__PURE__*/ Finder.byProps("openContextMenuLazy");

export interface ModalActions {
    openModal(e: any, t: any, n: any): any;
    openModalLazy(resolver: (...args: any[]) => Promise<any>, unknown: any): any;
    updateModal(e: any, t: any, n: any, r: any, i: any): any;
    closeAllModals(): any;
    closeModal(e: any, t: any): any;
    hasAnyModalOpen(): any;
    hasAnyModalOpenSelector(e: any): any;
    hasModalOpen(e: any, t: any): any;
    hasModalOpenSelector(e: any, t: any, n: any): any;
    useModalsStore(e: any, n: any): any;
}
export const ModalActions: ModalActions = /*@__PURE__*/ Finder.byProps("openModalLazy");

// COMPONENTS
export const Flex: UntypedComponent = /*@__PURE__*/ Finder.byName("Flex");
export const Button: UntypedComponent = /*@__PURE__*/ Finder.byProps("Link", "Hovers");
export const Text: UntypedComponent = /*@__PURE__*/ Finder.byName("Text");
export const Links: UntypedComponent = /*@__PURE__*/ Finder.byProps("Link", "NavLink");

export const Switch: UntypedComponent = /*@__PURE__*/ Finder.byName("Switch");
export const SwitchItem: UntypedComponent = /*@__PURE__*/ Finder.byName("SwitchItem");
export const RadioGroup: UntypedComponent = /*@__PURE__*/ Finder.byName("RadioGroup");
export const Slider: UntypedComponent = /*@__PURE__*/ Finder.byName("Slider");
export const TextInput: UntypedComponent = /*@__PURE__*/ Finder.byName("TextInput");

export const Menu: Record<string, UntypedComponent> = /*@__PURE__*/ Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form: Record<string, UntypedComponent> = /*@__PURE__*/ Finder.byProps("FormItem", "FormSection", "FormDivider");

// STYLE MODULES
export const margins: StyleModule = /*@__PURE__*/ Finder.byProps("marginLarge");
