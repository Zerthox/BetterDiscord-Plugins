import {Finder} from "../api";
import type {ActionModule, Snowflake, Untyped} from ".";
import type {Store} from "./flux";

export type MediaEngineContext = string;

export const enum MediaEngineContextType {
    DEFAULT = "default",
    STREAM = "stream"
}

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

export const MediaEngineHelpers: Record<string, any> = /* @__PURE__ */ Finder.byKeys(["MediaEngineEvent"]);

export const PendingAudioSettings: Record<string, any> = /* @__PURE__ */ Finder.byKeys(["getPendingAudioSettings"]);
