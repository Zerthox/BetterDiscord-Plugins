import * as Finder from "../finder";
import type {Snowflake, Store} from ".";

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

export const enum UserFlags {
    STAFF = 2**0,
    PARTNER = 2**1,
    HYPESQUAD = 2**2,
    BUG_HUNTER_LEVEL_1 = 2**3,
    MFA_SMS = 2**4,
    PREMIUM_PROMO_DISMISSED = 2**5,
    HYPESQUAD_ONLINE_HOUSE_1 = 2**6,
    HYPESQUAD_ONLINE_HOUSE_2 = 2**7,
    HYPESQUAD_ONLINE_HOUSE_3 = 2**8,
    PREMIUM_EARLY_SUPPORTER = 2**9,
    HAS_UNREAD_URGENT_MESSAGES = 2**13,
    BUG_HUNTER_LEVEL_2 = 2**15,
    VERIFIED_BOT = 2**16,
    VERIFIED_DEVELOPER = 2**17,
    CERTIFIED_MODERATOR = 2**18,
    BOT_HTTP_INTERACTIONS = 2**19,
    SPAMMER = 2**20,
    DISABLE_PREMIUM = 2**21,
    QUARANTINED = 2**44
}

export interface UserStore extends Store {
    filter(predicate: (user: User) => boolean, sorted?: boolean): User[];
    findByTag(username: string, discriminator: string): User;
    forEach(callback: (user: User) => boolean);
    getCurrentUser(): User;
    getUser(id: Snowflake): User;
    getUsers(): User[];
    __getLocalVars(): any;
}

export const UserStore: UserStore = /* @__PURE__ */ Finder.byName("UserStore");

export const enum StatusTypes {
    DND = "dnd",
    IDLE = "idle",
    INVISIBLE = "invisible",
    OFFLINE = "offline",
    ONLINE = "online",
    STREAMING = "streaming",
    UNKNOWN = "unknown"
}

export interface PresenceStoreState {
    statuses: Record<Snowflake, StatusTypes>;
    clientStatuses: Record<Snowflake, {desktop?: StatusTypes; mobile?: StatusTypes}>;
    activities: Record<Snowflake, any[]>;
    activityMetadata: Record<any, any>;

    /** Maps users to guilds to presences. */
    presencesForGuilds: Record<Snowflake, Record<Snowflake, any>>;
}

export interface PresenceStore extends Store {
    findActivity(e, t, n);
    getActivities(e, t);
    getActivityMetadata(e);
    getAllApplicationActivities(e);
    getApplicationActivity(e, t, n);
    getPrimaryActivity(e, t);
    getState(): PresenceStoreState;
    getStatus(user: Snowflake, t?, n?): StatusTypes;
    getUserIds(): Snowflake[];
    isMobileOnline(user: Snowflake): boolean;
    setCurrentUserOnConnectionOpen(e, t);
    __getLocalVars();
}

export const PresenceStore: PresenceStore = /* @__PURE__ */ Finder.byName("PresenceStore");

export const enum RelationshipTypes {
    NONE = 0,
    FRIEND = 1,
    BLOCKED = 2,
    PENDING_INCOMING = 3,
    PENDING_OUTGOING = 4,
    IMPLICIT = 5
}

export interface RelationshipStore extends Store {
    getFriendIDs(): Snowflake[];
    getNickname(arg: any): any;
    getPendingCount(): number;
    getRelationshipCount(): number;
    getRelationshipType(user: Snowflake): RelationshipTypes;
    getRelationships(): Record<Snowflake, RelationshipTypes>;
    isBlocked(user: Snowflake): boolean;
    isFriend(user: Snowflake): boolean;
    __getLocalVars();
}

export const RelationshipStore: RelationshipStore = /* @__PURE__ */ Finder.byName("RelationshipStore");
