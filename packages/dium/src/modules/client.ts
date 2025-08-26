import { Filters, Finder } from "../api";
import type { Store } from "./flux";

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
    selectGuild(e);
    addGuild(e, t, n, r);
    joinGuild(e, t);
    createGuild(e);
    deleteGuild(e);
    transitionToGuildSync(e, t, n, r);
    fetchApplications(e, t);

    collapseAllFolders();
    setGuildFolderExpanded(e, t);
    toggleGuildFolderExpand(e);

    setChannel(e, t, n);
    batchChannelUpdate(e, t);
    escapeToDefaultChannel(e);
    move(e, t, n, r);
    moveById(e, t, n, r);
    nsfwAgree(e);
    nsfwReturnToSafety(e);

    createRole(e);
    createRoleWithNameColor(e, t, n);
    deleteRole(e, t);
    batchRoleUpdate(e, t);
    updateRole(e, t, n);
    updateRolePermissions(e, t, n);
    assignGuildRoleConnection(e, t);
    fetchGuildRoleConnectionsEligibility(e, t);

    requestMembers(e, t, n, r);
    requestMembersById(e, t, n);
    setServerDeaf(e, t, n);
    setServerMute(e, t, n);
    fetchGuildBans(e);
    banUser(e, t, n, r);
    unbanUser(e, t);
    kickUser(e, t, n);

    setCommunicationDisabledUntil(e, t, n, i, o);
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
