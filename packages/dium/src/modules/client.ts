import {Filters, Finder} from "../api";
import type {ActionModule, Snowflake, Untyped} from ".";
import type {Store} from "./flux";

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

export const UserSettings: UserSettings = /* @__PURE__ */ Finder.find(Filters.byEntry(Filters.byKeys("updateSetting"), true));

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
    isLocalMute(): boolean;
    isHardwareMute(): boolean;
    isSelfDeaf(context?: MediaEngineContext): boolean;
    isSelfMute(context?: MediaEngineContext): boolean;
    isSelfMutedTemporarily(): boolean;
    isVideoAvailable(): boolean;
    isVideoEnabled(): boolean;
    isSoundSharing(): boolean;
    getInputDevices(): Record<string, any>;
    getInputDeviceId(): string;
    getInputVolume(): number;
    getOutputDevices(): Record<string, any>;
    getOutputDeviceId(): string;
    getOutputVolume(): number;
    getVideoDevices(): Record<string, any>;
    getVideoDeviceId(): string;
}

export const MediaEngineStore: MediaEngineStore = /* @__PURE__ */ Finder.byName("MediaEngineStore");

export interface MediaEngineDesktopSource {
    sourceId?: any;
    preset?: any;
    resolution?: any;
    frameRate?: any;
    sound?: any;
    context?: any;
}

export interface MediaEngineActions extends ActionModule {
    enable(unmute?: any): Promise<boolean>;
    toggleSelfMute(options?: {context?: MediaEngineContext; syncRemove?: any}): Promise<void>;
    setTemporarySelfMute(mute: any): void;
    toggleSelfDeaf(options?: {context?: MediaEngineContext; syncRemove?: any}): void;
    toggleLocalMute(userId: Snowflake, context?: MediaEngineContext): void;
    toggleLocalSoundboardMute(userId: Snowflake, context?: MediaEngineContext): void;
    setDisableLocalVideo(userId: Snowflake, disableVideo: any, context?: MediaEngineContext, persist?: boolean, isAutomatic?: boolean, isNoop?: boolean): void;
    setLocalVolume(userId: Snowflake, volume: number, context?: MediaEngineContext): void;
    setLocalPan(userId: Snowflake, left: number, right: number, context?: MediaEngineContext): void;
    setMode(mode: any, options?: any, context?: MediaEngineContext): void;
    setInputVolume(volume: number): void;
    setOutputVolume(volume: number): void;
    setInputDevice(id: any, t: any): void;
    setOutputDevice(id: any, t: any): void;
    setVideoDevice(id: any, t: any): void;
    setEchoCancellation(enabled: boolean, location: any): void;
    setLoopback(enabled: boolean): void;
    setNoiseSuppression(enabled: boolean, location: any): void;
    setNoiseCancellation(enabled: boolean, location: any): void;
    setAutomaticGainControl(enabled: boolean, location: any): void;
    setExperimentalEncoders(enabled: boolean): void;
    setHardwareH264(enabled: boolean): void;
    setAttenuation(attentuation: any, attenuateWhileSpeakingSelf: any, attenuateWhileSpeakingOthers: any): void;
    setQoS(enabled: boolean): void;
    reset(): void;
    setSilenceWarning(enabled: boolean): void;
    setDebugLogging(enabled: boolean): void;
    setVideoHook(enabled: boolean): void;
    setExperimentalSoundshare(enabled: boolean): void;
    setAudioSubsystem(subsystem: any): void;
    setVideoEnabled(enabled: boolean): void;
    setDesktopSource(source: MediaEngineDesktopSource): void;
    setOpenH264(enabled: boolean): void;
    setAV1Enabled(enabled: boolean): void;
    setH265Enabled(enabled: boolean): void;
    setAecDump(enabled: boolean): void;
    interact(): void;
    enableSoundshare(): void;
}

export const MediaEngineActions: MediaEngineActions = /* @__PURE__ */ Finder.byKeys(["setLocalVolume"]);
