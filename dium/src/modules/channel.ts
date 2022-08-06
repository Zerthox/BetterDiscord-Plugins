import * as Finder from "../api/finder";
import type {Untyped, Snowflake, Store} from ".";

/**
 * A Channel.
 *
 * Includes all kinds of channels.
 */
export interface Channel {
    id: Snowflake;
    name: string;
    type: ChannelType;
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
export const enum ChannelType {
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

export const ChannelStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("getChannel", "hasChannel");

export const ChannelActions: any = /* @__PURE__ */ Finder.byProps("selectChannel");

export const SelectedChannelStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("getChannelId", "getVoiceChannelId");
