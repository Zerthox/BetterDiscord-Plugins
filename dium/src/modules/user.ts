import * as Finder from "../api/finder";
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

export const enum StatusType {
    DND = "dnd",
    IDLE = "idle",
    INVISIBLE = "invisible",
    OFFLINE = "offline",
    ONLINE = "online",
    STREAMING = "streaming",
    UNKNOWN = "unknown"
}

export interface PresenceStoreState {
    statuses: Record<Snowflake, StatusType>;
    clientStatuses: Record<Snowflake, {desktop?: StatusType; mobile?: StatusType}>;
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
    getStatus(user: Snowflake, t?, n?): StatusType;
    getUserIds(): Snowflake[];
    isMobileOnline(user: Snowflake): boolean;
    setCurrentUserOnConnectionOpen(e, t);
    __getLocalVars();
}

export const PresenceStore: PresenceStore = /* @__PURE__ */ Finder.byName("PresenceStore");

export const enum RelationshipType {
    BLOCKED = 2,
    FRIEND = 1,
    IMPLICIT = 5,
    NONE = 0,
    PENDING_INCOMING = 3,
    PENDING_OUTGOING = 4
}

export interface RelationshipStore extends Store {
    getFriendIDs(): Snowflake[];
    getNickname(arg: any): any;
    getPendingCount(): number;
    getRelationshipCount(): number;
    getRelationshipType(user: Snowflake): RelationshipType;
    getRelationships(): Record<Snowflake, RelationshipType>;
    isBlocked(user: Snowflake): boolean;
    isFriend(user: Snowflake): boolean;
    __getLocalVars();
}

export const RelationshipStore: RelationshipStore = /* @__PURE__ */ Finder.byName("RelationshipStore");
