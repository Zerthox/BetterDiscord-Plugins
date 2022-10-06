import * as Finder from "../api/finder";
import type {Untyped, Snowflake, Store, User, ActionModule} from ".";

export const enum MessageType {
    Default = 0,
    RecipientAdd = 1,
    RecipientRemove = 2,
    Call = 3,
    ChannelNameChange = 4,
    ChannelIconChange = 5,
    ChannelPinnedMessage = 6,
    UserJoin = 7,
    UserPremiumGuildSubscription = 8,
    UserPremiumGuildSubscriptionTier1 = 9,
    UserPremiumGuildSubscriptionTier2 = 10,
    UserPremiumGuildSubscriptionTier3 = 11,
    ChannelFollowAdd = 12,
    GuildStream = 13,
    GuildDiscoveryDisqualified = 14,
    GuildDiscoveryRequalified = 15,
    GuildDiscoveryGracePeriodInitialWarning = 16,
    GuildDiscoveryGracePeriodFinalWarning = 17,
    ThreadCreated = 18,
    Reply = 19,
    ChatInputCommand = 20,
    ThreadStarterMessage = 21,
    GuildInviteReminder = 22,
    ContextMenuCommand = 23
}

export const enum MessageState {
    Sending = "SENDING",
    SendFailed = "SEND_FAILED",
    Sent = "SENT"
}

export const enum MessageFlags {
    None = 0,
    Crossposted = 1,
    IsCrosspost = 2,
    SuppressEmbeds = 4,
    SourceMessageDeleted = 8,
    Urgent = 16,
    HasThread = 32,
    Ephemeral = 64,
    Loading = 128,
    FailedToMentionSomeRolesInThread = 256
}

/** A message. */
export interface Message {
    type: MessageType;
    author: User;
    content: string;

    timestamp: import("moment").Moment;
    editedTimestamp?: any;
    state: MessageState;

    /** Message ID of parent. */
    nonce?: Snowflake;

    flags: MessageFlags;
    attachments: any[];
    codedLinks: any[];
    components: any[];
    embeds: any[];
    giftCodes: any[];
    mentionChannels: any[];
    mentionEveryone: boolean;
    mentionRoles: any[];
    mentioned: boolean;
    mentions: any[];
    messageReference?: any;
    reactions: any[];
    stickerItems: any[];
    stickers: any[];

    activity?: any;
    application?: any;
    applicationId?: any;
    blocked: boolean;
    bot: boolean;
    call?: any;
    colorString?: any;
    customRenderedContent?: any;
    id: Snowflake;
    interaction?: any;
    interactionData?: any;
    interactionError?: any;
    isSearchHit: boolean;
    loggingName?: any;
    nick?: any;
    pinned: boolean;
    tts: boolean;
    webhookId?: any;

    addReaction(arg1: any, arg2: any): void;
    getChannelId(): Snowflake;
    getReaction(arg: any): any;
    hasFlag(flag: MessageFlags): boolean;
    isCommandType(): boolean;
    isEdited(): boolean;
    isSystemDM(): boolean;
    removeReaction(arg1: any, arg2: any): void;
    removeReactionsForEmoji(arg: any): void;
    toJS(): any;
}

export const MessageStore: Untyped<Store> = /* @__PURE__ */ Finder.byName("MessageStore");

export const MessageActions: ActionModule = /* @__PURE__ */ Finder.byProps("jumpToMessage", "_sendMessage");
