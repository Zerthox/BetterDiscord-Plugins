import { Filters, Finder } from "../api";
import type { Store } from "./flux";

export type PlatformType = keyof Platforms["PlatformTypes"];

export interface Platforms {
    PlatformTypes: {
        WINDOWS: "WINDOWS";
        OSX: "OSX";
        LINUX: "LINUX";
        WEB: "WEB";
    };
    isPlatformEmbedded: boolean;

    getDevicePushProvider(): any;
    getOS(): string;
    getPlatform(): "WINDOWS" | "OSX" | "LINUX" | "WEB";
    getPlatformName(): string;

    isAndroid(): boolean;
    isAndroidChrome(): boolean;
    isAndroidWeb(): boolean;
    isDesktop(): boolean;
    isIOS(): boolean;
    isLinux(): boolean;
    isOSX(): boolean;
    isWeb(): boolean;
    isWindows(): boolean;
}

// TODO: demangle
export const Platforms: Platforms = /* @__PURE__ */ Finder.find(Filters.byEntry(Filters.byKeys("WINDOWS", "WEB")));

export interface ClientActions {
    selectGuild(e: any): any;
    addGuild(e: any, t: any, n: any, r: any): any;
    joinGuild(e: any, t: any): any;
    createGuild(e: any): any;
    deleteGuild(e: any): any;
    transitionToGuildSync(e: any, t: any, n: any, r: any): any;
    fetchApplications(e: any, t: any): any;

    collapseAllFolders(): any;
    setGuildFolderExpanded(e: any, t: any): any;
    toggleGuildFolderExpand(e: any): any;

    setChannel(e: any, t: any, n: any): any;
    batchChannelUpdate(e: any, t: any): any;
    escapeToDefaultChannel(e: any): any;
    move(e: any, t: any, n: any, r: any): any;
    moveById(e: any, t: any, n: any, r: any): any;
    nsfwAgree(e: any): any;
    nsfwReturnToSafety(e: any): any;

    createRole(e: any): any;
    createRoleWithNameColor(e: any, t: any, n: any): any;
    deleteRole(e: any, t: any): any;
    batchRoleUpdate(e: any, t: any): any;
    updateRole(e: any, t: any, n: any): any;
    updateRolePermissions(e: any, t: any, n: any): any;
    assignGuildRoleConnection(e: any, t: any): any;
    fetchGuildRoleConnectionsEligibility(e: any, t: any): any;

    requestMembers(e: any, t: any, n: any, r: any): any;
    requestMembersById(e: any, t: any, n: any): any;
    setServerDeaf(e: any, t: any, n: any): any;
    setServerMute(e: any, t: any, n: any): any;
    fetchGuildBans(e: any): any;
    banUser(e: any, t: any, n: any, r: any): any;
    unbanUser(e: any, t: any): any;
    kickUser(e: any, t: any, n: any): any;

    setCommunicationDisabledUntil(e: any, t: any, n: any, i: any, o: any): any;
}

export const ClientActions: ClientActions = /* @__PURE__ */ Finder.byKeys(["toggleGuildFolderExpand"]);

export interface UserSetting<T> {
    getSetting(): T;
    updateSetting(n: T): any;
    useSetting(): T;
}

export type UserSettings = Record<string, UserSetting<any>>;

export const UserSettings: UserSettings = /* @__PURE__ */ Finder.find(
    Filters.byEntry(Filters.byKeys("updateSetting"), true),
);

export interface UserSettingsProtoStore extends Store {
    computeState(): any;
    frecencyWithoutFetchingLatest: any;
    getDismissedGuildContent(e: any): any;
    getFullState(): any;
    getGuildFolders(): any;
    getGuildRecentsDismissedAt(e: any): any;
    getGuildsProto(): any;
    getState(): any;
    hasLoaded(e: any): any;
    settings: any;
    wasMostRecentUpdateFromServer: any;
}

export const UserSettingsProtoStore: UserSettingsProtoStore = /* @__PURE__ */ Finder.byName("UserSettingsProtoStore");

export interface LocaleStore extends Store {
    get locale(): any;
    __getLocalVars(): any;
}

export const LocaleStore: LocaleStore = /* @__PURE__ */ Finder.byName("LocaleStore");

export interface ThemeStore extends Store {
    get theme(): any;
    getState(): any;
    __getLocalVars(): any;
}

export const ThemeStore: ThemeStore = /* @__PURE__ */ Finder.byName("ThemeStore");
