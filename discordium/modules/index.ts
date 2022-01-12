import React from "react";
import * as Finder from "../finder";

export * from "./npm";
export {Dispatch, Events} from "./dispatch";
export {Flux} from "./flux";

// DISCORD GENERAL

export const Constants = Finder.byProps("Permissions", "RelationshipTypes");

export const i18n = Finder.byProps("languages", "getLocale");

// DISCORD STORES/ACTIONS

export const Channels = Finder.byProps("getChannel", "hasChannel");

export const SelectedChannel = Finder.query({props: ["getChannelId", "getVoiceChannelId"], export: "default"});

export const Users = Finder.byProps("getUser", "getCurrentUser");

export const Members = Finder.byProps("getMember", "isMember");

export interface ContextMenuActions {
    openContextMenu(e, t, n, r);
    openContextMenuLazy(event: React.MouseEvent, resolver: (...args: any[]) => Promise<any>, unknown: any);
    closeContextMenu();
}

export const ContextMenuActions: ContextMenuActions = Finder.byProps("openContextMenuLazy");

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

export const ModalActions: ModalActions = Finder.byProps("openModalLazy");

// DISCORD COMPONENTS

export const Flex = Finder.byName("Flex");

export const Button = Finder.byProps("Link", "Hovers");

export const Menu = Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");

export const Form = Finder.byProps("FormItem", "FormSection", "FormDivider");

// DISCORD STYLE MODULES

export const margins = Finder.byProps("marginLarge");
