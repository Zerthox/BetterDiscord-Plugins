import * as Finder from "../api/finder";
import type {Untyped, Snowflake, Store} from ".";

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
    getAvatarURL(arg1: any, arg2: any, arg3: any): string;
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

export const UserStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("getUser", "getCurrentUser");

export const PresenceStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("getState", "getStatus", "isMobileOnline");

export const RelationshipStore: Untyped<Store> = /* @__PURE__ */ Finder.byProps("isFriend", "getRelationshipCount");
