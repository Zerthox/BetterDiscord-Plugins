import {Finder} from "../api";
import type {Untyped, Snowflake, User, ActionModule} from ".";
import type {Store} from "./flux";

export const enum MessageTypes {
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

export const enum MessageStates {
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
    type: MessageTypes;
    author: User;
    content: string;

    timestamp: import("moment").Moment;
    editedTimestamp?: any;
    state: MessageStates;

    /** Message ID of parent. */
    nonce?: Snowflake;

    flags: MessageFlags;
    attachments: any[];
    codedLinks: any[];
    components: any[];
    embeds: Embed[];
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

export const enum EmbedTypes {
    TEXT = "text",
    RICH = "rich",
    IMAGE = "image",
    VIDEO = "video",
    GIFV = "gifv",
    ARTICLE = "article",
    LINK = "link",
    TWEET = "tweet",
    APPLICATION_NEWS = "application_news",
    AUTO_MODERATION_MESSAGE = "auto_moderation_message",
    AUTO_MODERATION_NOTIFICATION = "auto_moderation_notification"
}

export interface Embed {
    type?: EmbedTypes;
    id?: string;
    referenceId?: any;
    rawTitle?: string;
    author?: EmbedAuthor;
    rawDescription?: string;
    url?: string;
    color?: number;
    image?: EmbedMedia;
    thumbnail?: EmbedMedia;
    video?: EmbedMedia;
    provider?: EmbedProvider;
    fields?: EmbedField[];
    footer?: EmbedFooter;
}

export interface EmbedAuthor {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface EmbedProvider {
    name?: string;
    url?: string;
}

export interface EmbedMedia {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}

export interface EmbedField {
    name: string;
    value: string;
    inline?: boolean;
}

export interface EmbedFooter {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
}

export interface Attachment {
    id?: string;
    filename?: string;
    url?: string;
    proxy_url?: string;
    content_type?: string;
    height?: number;
    width?: number;
    size?: number;
    spoiler?: boolean;
}

export const MessageStore: Untyped<Store> = /* @__PURE__ */ Finder.byName("MessageStore");

export interface MessageActions extends ActionModule {
    receiveMessage(e: any, t: any): any;
    sendBotMessage(e: any, t: any, n: any): any;
    sendClydeError(e: any): any;
    truncateMessages(e: any, t: any, n: any): any;
    clearChannel(e: any): any;

    jumpToPresent(e: any, t: any): any;
    jumpToMessage(e: any): any;
    trackJump(e: any, t: any, n: any, r: any): any;
    focusMessage(e: any): any;

    fetchMessages(e: any): any;
    _tryFetchMessagesCached(e: any): any;

    sendMessage(e: any, t: any, n?: any, r?: any): any;
    getSendMessageOptionsForReply(e: any): any;
    sendInvite(e: any, t: any, n: any, r: any): any;
    sendStickers(e: any, t: any): any;
    sendGreetMessage(e: any, t: any): any;
    _sendMessage(e: any, t: any, r: any): any;

    startEditMessage(e: any, t: any, n: any): any;
    updateEditMessage(e: any, t: any, n: any): any;
    endEditMessage(e: any, t: any): any;
    editMessage(e: any, t: any, n: any): any;
    suppressEmbeds(e: any, t: any): any;
    patchMessageAttachments(e: any, t: any, n: any): any;

    deleteMessage(e: any, t: any): any;
    dismissAutomatedMessage(e: any): any;

    revealMessage(e: any, t: any): any;
    crosspostMessage(e: any, t: any): any;
    trackInvite(e: any): any;
}

export const MessageActions: MessageActions = /* @__PURE__ */ Finder.byKeys(["jumpToMessage", "_sendMessage"]);
