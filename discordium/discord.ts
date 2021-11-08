// TODO: complete typing

/** A timestamped ID stored as a string. */
export type Snowflake = string;

/** A User. */
export interface User {
    id: Snowflake;
    username: string;
    discriminator: string;
    avatar: string;
    email: string;
    phone?: any;

    accentColor?: any;
    banner?: any;
    bio: string;

    bot: boolean;
    desktop: boolean;
    mobile: boolean;
    system: boolean;
    verified: boolean;
    mfaEnabled: boolean;
    nsfwAllowed: boolean;
    flags: number;

    premiumType?: any;
    premiumUsageFlags: number;
    publicFlags: number;
    purchasedFlags: number;

    guildMemberAvatars: Record<any, any>;

    get createdAt(): Date;
    get hasPremiumPerks(): boolean;
    get tag(): string;
    get usernameNormalized(): string;

    addGuildAvatarHash(arg1: any, arg2: any): any;
    getAvatarSource(arg1: any, arg2: any): any;
    getAvatarURL(arg1: any, t, arg2: any): string;
    getBannerSource(arg1: any, arg2: any): any;
    getBannerURL(arg1: any, arg2: any): string;
    removeGuildAvatarHash(arg: any): any;

    hasAvatarForGuild(guildId: Snowflake): boolean;
    hasFlag(flag: any): boolean;
    hasFreePremium(): boolean;
    hasHadSKU(sku: any): boolean;
    hasPremiumUsageFlag(flag: any): boolean;
    hasPurchasedFlag(flag: any): boolean;
    hasUrgentMessages(): boolean;
    isClaimed(): boolean;
    isLocalBot(): boolean;
    isNonUserBot(): boolean;
    isPhoneVerified(): boolean;
    isStaff(): boolean;
    isSystemUser(): boolean;
    isVerifiedBot(): boolean;

    toString(): string;
}

/** A Guild (server). */
export interface Guild {
    id: Snowflake;
    name: string;
    icon: string;
    ownerId: Snowflake;
    description?: string;

    banner?: any;
    splash?: any;

    maxMembers: number;
    maxVideoChannelUsers: number;
    defaultMessageNotifications: number;
    region: string;
    preferredLocale: string;

    verificationLevel: number;
    explicitContentFilter: number;
    mfaLevel: number;
    nsfwLevel: number;
    premiumTier: number;
    premiumSubscriberCount: number;
    premiumProgressBarEnabled: boolean;

    features: Set<Feature>;

    joinedAt: Date;

    roles: Record<Snowflake, Role>;

    rulesChannelId?: Snowflake;
    publicUpdatesChannelId?: Snowflake;

    afkChannelId?: Snowflake;
    afkTimeout?: number;

    systemChannelId?: Snowflake;
    systemChannelFlags?: number;

    get acronym(): string;

    getApplicationId(): any;
    getIconSource(arg1: any, arg2: any): any;
    getIconURL(arg1: any, arg2: any): any;
    getMaxEmojiSlot(): number;
    getRole(roleId: Snowflake): Role;

    hasFeature(feature: Feature): boolean;
    isLurker(): boolean;
    isNew(memberId: Snowflake): boolean;
    isOwner(memberId: Snowflake): boolean;
    isOwnerWithRequiredMfaLevel(memberId: Snowflake): boolean;

    toString(): string;
}

/** A Guild Role. */
export interface Role {
    id: Snowflake;
    name: string;

    color: number;
    colorString?: string;
    icon?: any;
    unicodeEmoji?: any;
    tags?: any;

    mentionable: boolean;
    hoist: boolean;
    managed: boolean;
    position: number;
    originalPosition: number;

    permissions: Permissions;
}

/** A Guild Feature. */
export type Feature = any;

/** A collection of Guild premissions stored as bitflag number. */
export type Permissions = number;

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

    get accessPermission(): any;
    get lastActiveTimestamp(): any;
    get viewPermission(): any;

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

/** A Member of a Guild. */
export interface Member {
    guildId: Snowflake;
    userId: Snowflake;

    colorString: string;
    nick?: any;
    joinedAt: string;
    guildMemberAvatar?: any;
    guildMemberBanner?: any;
    guildMemberBio: string;

    hoistRoleId: string;
    iconRoleId?: any;

    communicationDisabledUntil?: any;
    isPending: boolean;
    premiumSince?: any;

    roles: Snowflake[];
}
