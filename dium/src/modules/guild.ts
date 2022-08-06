import * as Finder from "../api/finder";
import type {Untyped, Snowflake, Store} from ".";

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

    features: Set<GuildFeature>;

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

    hasFeature(feature: GuildFeature): boolean;
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
export type GuildFeature = any;

/** A collection of Guild permissions stored as bitflag number. */
export type Permissions = number;

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

export interface GuildStore extends Store {
    getGuild(id: Snowflake): Guild;
    getGuildCount(): number;
    getGuilds(): Guild[];
    __getLocalVars(): any;
}

export const GuildStore: GuildStore = /* @__PURE__ */ Finder.byProps("getGuild");

export const GuildActions: any = /* @__PURE__ */ Finder.byProps("requestMembers");

export const GuildMemberStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("getMember", "isMember");
