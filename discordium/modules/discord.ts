import * as Finder from "../api/finder";

// GENERAL
export const Constants = () => Finder.byProps("Permissions", "RelationshipTypes");
export const i18n = () => Finder.byProps("languages", "getLocale");

// STORES/ACTIONS
export const Channels = () => Finder.byProps("getChannel", "hasChannel");
export const SelectedChannel = () => Finder.byProps("getChannelId", "getVoiceChannelId");
export const Users = () => Finder.byProps("getUser", "getCurrentUser");
export const Members = () => Finder.byProps("getMember", "isMember");

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
export const Flex = () => Finder.byName("Flex");
export const Button = () => Finder.byProps("Link", "Hovers");
export const Text = () => Finder.byName("Text");
export const Links = () => Finder.byProps("Link", "NavLink");

export const Switch = () => Finder.byName("Switch");
export const SwitchItem = () => Finder.byName("SwitchItem");
export const RadioGroup = () => Finder.byName("RadioGroup");
export const Slider = () => Finder.byName("Slider");
export const TextInput = () => Finder.byName("TextInput");

export const Menu = () => Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator");
export const Form = () => Finder.byProps("FormItem", "FormSection", "FormDivider");

// STYLE MODULES
export const margins = () => Finder.byProps("marginLarge");
