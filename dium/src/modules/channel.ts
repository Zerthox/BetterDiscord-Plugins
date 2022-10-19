import {Finder} from "../api";
import type {Snowflake, ActionModule} from "./general";
import type {Store} from "./flux";

/** A Channel. */
export interface Channel {
    id: Snowflake;
    name: string;
    type: ChannelTypes;
    topic: string;

    bitrate: number;
    defaultAutoArchiveDuration?: any;
    icon?: any;
    userLimit: number;

    member?: any;
    memberCount?: any;
    memberIdsPreview?: any;
    memberListId?: any;
    messageCount?: any;

    nicks: Record<any, any>;
    nsfw: boolean;

    originChannelId?: Snowflake;
    ownerId?: Snowflake;

    permissionOverwrites: Record<Snowflake, {
        type: number;
        id: Snowflake;
        allow: Permissions;
        deny: Permissions;
    }>;

    position: number;
    lastMessageId: Snowflake;
    lastPinTimestamp: string;
    rateLimitPerUser: number;
    rawRecipients: any[];
    recipients: any[];
    rtcRegion?: any;
    threadMetadata?: any;
    videoQualityMode?: any;

    accessPermission: any;
    lastActiveTimestamp: any;
    viewPermission: any;

    computeLurkerPermissionsAllowList(): any;
    getApplicationId(): any;
    getGuildId(): Snowflake;
    getRecipientId(): any;

    isActiveThread(): boolean;
    isArchivedThread(): boolean;
    isCategory(): boolean;
    isDM(): boolean;
    isDirectory(): boolean;
    isGroupDM(): boolean;
    isGuildStageVoice(): boolean;
    isGuildVoice(): boolean;
    isListenModeCapable(): boolean;
    isManaged(): boolean;
    isMultiUserDM(): boolean;
    isNSFW(): boolean;
    isOwner(memberId: Snowflake): boolean;
    isPrivate(): boolean;
    isSubscriptionGatedInGuild(arg: any): boolean;
    isSystemDM(): boolean;
    isThread(): boolean;
    isVocal(): boolean;
}

/** Types of Channels. */
export const enum ChannelTypes {
    GuildText = 0,
    DM = 1,
    GuildVoice = 2,
    GroupDM = 3,
    GuildCategory = 4,
    GuildAnnouncement = 5,
    GuildStore = 6,
    AnnouncementThread = 10,
    PublicThread = 11,
    PrivateThread = 12,
    GuildStageVoice = 13,
    GuildDirectory = 14,
    GuildForum = 15
}

export interface ChannelStore extends Store {
    getAllThreadsForParent(e);
    getBasicChannel(e);
    getCachedChannelJsonForGuild(e);
    getChannel(id: Snowflake): Channel;
    getDMFromUserId(e);
    getDMUserIds();
    getGuildChannelsVersion(e);
    getInitialOverlayState();
    getMutableBasicGuildChannelsForGuild(e);
    getMutableGuildChannelsForGuild(e);
    getMutablePrivateChannels();
    getPrivateChannelsVersion();
    getSortedPrivateChannels();
    hasChannel(e);
    hasRestoredGuild(e);
    loadAllGuildAndPrivateChannelsFromDisk();
    __getLocalVars();
}

export const ChannelStore: ChannelStore = /* @__PURE__ */ Finder.byName("ChannelStore");

export const ChannelActions: ActionModule = /* @__PURE__ */ Finder.byProps(["selectChannel"]);

export interface SelectedChannelStore extends Store {
    getChannelId(e);
    getCurrentlySelectedChannelId(e);
    getLastChannelFollowingDestination();
    getLastSelectedChannelId(e?: any): Snowflake;
    getLastSelectedChannels(e);
    getMostRecentSelectedTextChannelId(e);
    getVoiceChannelId(): Snowflake;
    __getLocalVars();
}

export const SelectedChannelStore: SelectedChannelStore = /* @__PURE__ */ Finder.byName("SelectedChannelStore");

export interface VoiceState {
    channelId: Snowflake;
    userId: Snowflake;
    sessionId: string;
    deaf: boolean;
    mute: boolean;
    selfMute: boolean;
    selfDeaf: boolean;
    selfVideo: boolean;
    selfStream: boolean;
    suppress: boolean;
    requestToSpeakTimestamp?: any;
}

export interface VoiceStateStore extends Store {
    getAllVoiceStates(): Record<Snowflake | "@me", Record<Snowflake, VoiceState>>;
    getVoiceStates(id?: string): Record<Snowflake, VoiceState>;
    getVoiceStatesForChannel(channelId: Snowflake): Record<Snowflake, VoiceState>;
    getVideoVoiceStatesForChannel(channelId: Snowflake): any;

    getVoiceState(id: string, userId: Snowflake): VoiceState;
    getVoiceStateForChannel(channelId: Snowflake, userId?: Snowflake): VoiceState;
    getVoiceStateForSession(userId: Snowflake, session?: string): VoiceState;
    getVoiceStateForUser(userId: Snowflake): VoiceState;

    getCurrentClientVoiceChannelId(id: string): Snowflake;
    getUserVoiceChannelId(id: string, userId: Snowflake): Snowflake;

    hasVideo(userId: Snowflake): boolean;
    isCurrentClientInVoiceChannel(): boolean;
    isInChannel(channelId: Snowflake, userId?: Snowflake): boolean;

    get userHasBeenMovedVersion(): number;
    __getLocalVars(): any;
}

export const VoiceStateStore: VoiceStateStore = /* @__PURE__ */ Finder.byName("VoiceStateStore");
