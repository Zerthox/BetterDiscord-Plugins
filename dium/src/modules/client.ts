import * as Finder from "../finder";
import * as Filters from "../filters";
import type {ActionModule, Snowflake, Store, Untyped} from ".";

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
export const Platforms: Platforms = /* @__PURE__ */ Finder.find(Filters.byEntry(Filters.byProps("WINDOWS", "WEB")));

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

export const ClientActions: ClientActions = /* @__PURE__ */ Finder.byProps(["toggleGuildFolderExpand"]);

export interface UserSetting<T> {
    getSetting(): T;
    updateSetting(n: T): any;
    useSetting(): T;
}

export type UserSettings = Record<string, UserSetting<any>>;

export const UserSettings: UserSettings = /* @__PURE__ */ Finder.find(Filters.byEntry(Filters.byProps("updateSetting"), true));

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

export type MediaEngineContext = any;

export interface MediaEngineStore extends Untyped<Store> {
    getMediaEngine(): any;
    getLocalPan(userId: Snowflake, context?: MediaEngineContext): {left: number; right: number};
    getLocalVolume(userId: Snowflake, context?: MediaEngineContext): number;
    getLoopback(): boolean;
    getNoiseCancellation(): boolean;
    getNoiseSuppression(): boolean;
    isDeaf(): boolean;
    isMute(): boolean;
    isSelfDeaf(context?: MediaEngineContext): boolean;
    isSelfMute(context?: MediaEngineContext): boolean;
}

export const MediaEngineStore: MediaEngineStore = /* @__PURE__ */ Finder.byName("MediaEngineStore");

export interface MediaEngineActions extends ActionModule {
    setLocalPan(userId: Snowflake, left: number, right: number, context?: MediaEngineContext): void;
    setLocalVolume(userId: Snowflake, volume: number, context?: MediaEngineContext): void;
    setLoopback(enabled: boolean): void;
    setNoiseCancellation(enabled: boolean, location: any): void;
    setNoiseSuppression(enabled: boolean, location: any): void;
    toggleSelfDeaf(options?: {context: MediaEngineContext; syncRemove: any}): void;
    toggleSelfMute(options?: {context: MediaEngineContext; syncRemove: any}): Promise<void>;
    setTemporarySelfMute(mute: any): void;
    toggleLocalMute(userId: Snowflake, context?: MediaEngineContext): void;
}

export const MediaEngineActions: MediaEngineActions = /* @__PURE__ */ Finder.byProps(["setLocalVolume"]);
