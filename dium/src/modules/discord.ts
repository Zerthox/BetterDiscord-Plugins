/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as Finder from "../api/finder";
import {UntypedStore, UntypedComponent, StyleModule} from ".";

// GENERAL
export const Constants = () => Finder.byProps("Permissions", "RelationshipTypes");
export const i18n = () => Finder.byProps("languages", "getLocale");
export const Platforms = () => Finder.byProps("getPlatform", "isWindows", "isWeb", "PlatformTypes");

// STORES/ACTIONS
export const ClientActions = () => Finder.byProps("toggleGuildFolderExpand");

export const ChannelStore = (): UntypedStore => Finder.byProps("getChannel", "hasChannel");
export const SelectedChannelStore = (): UntypedStore => Finder.byProps("getChannelId", "getVoiceChannelId");

export const UserStore = (): UntypedStore => Finder.byProps("getUser", "getCurrentUser");
export const GuildMemberStore = (): UntypedStore => Finder.byProps("getMember", "isMember");
export const PresenceStore = (): UntypedStore => Finder.byProps("getState", "getStatus", "isMobileOnline");
export const RelationshipStore = (): UntypedStore => Finder.byProps("isFriend", "getRelationshipCount");

export const MediaEngineStore = (): UntypedStore => Finder.byProps("getLocalVolume");
export const MediaEngineActions = (): UntypedStore => Finder.byProps("setLocalVolume");

export interface ContextMenuActions {
    openContextMenu(e, t, n, r);
    openContextMenuLazy(event: React.MouseEvent, resolver: (...args: any[]) => Promise<any>, unknown: any);
    closeContextMenu();
}

export const ContextMenuActions = (): ContextMenuActions => Finder.byProps("openContextMenuLazy");

export interface ModalActions {
    openModal(e, t, n);
    openModalLazy(resolver: (...args: any[]) => Promise<any>, unknown: any);
    updateModal(e, t, n, r, i);
    closeAllModals();
    closeModal(e, t);
    hasAnyModalOpen();
    hasAnyModalOpenSelector(e);
    hasModalOpen(e, t);
    hasModalOpenSelector(e, t, n);
    useModalsStore(e, n);
}

export const ModalActions = (): ModalActions => Finder.byProps("openModalLazy");

// COMPONENTS
export const Flex = (): UntypedComponent => Finder.byName("Flex");
export const Button = (): UntypedComponent => Finder.byProps("Link", "Hovers");
export const Text = (): UntypedComponent => Finder.byName("Text");
export const Links = (): UntypedComponent => Finder.byProps("Link", "NavLink");

export const Switch = (): UntypedComponent => Finder.byName("Switch");
export const SwitchItem = (): UntypedComponent => Finder.byName("SwitchItem");
export const RadioGroup = (): UntypedComponent => Finder.byName("RadioGroup");
export const Slider = (): UntypedComponent => Finder.byName("Slider");
export const TextInput = (): UntypedComponent => Finder.byName("TextInput");

export const Menu = (): Record<string, UntypedComponent> => Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form = (): Record<string, UntypedComponent> => Finder.byProps("FormItem", "FormSection", "FormDivider");

// STYLE MODULES
export const margins = (): StyleModule => Finder.byProps("marginLarge");
