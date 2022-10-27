import {Finder} from "../api";
import {Channel, Message} from "../modules";

interface MessageFooterProps {
    channel: Channel;
    message: Message;
    compact: boolean;
    className?: string;
    canDeleteAttachments?: boolean;
    canSuppressEmbeds?: boolean;
    disableReactionCreates?: boolean;
    disableReactionReads?: boolean;
    disableReactionUpdates?: boolean;
    gifAutoPlay?: boolean;
    hasSpoilerEmbeds?: boolean;
    inlineAttachmentMedia?: boolean;
    inlineEmbedMedia?: boolean;
    isCurrentUser?: boolean;
    isInteracting?: boolean;
    isLurking?: boolean;
    isPendingMember?: boolean;
    forceAddReactions?: any;
    onAttachmentContextMenu?: (e: any, t: any) => any;
    renderComponentAccessory?: any;
    renderEmbeds?: boolean;
    renderSuppressEmbeds?: any;
    renderThreadAccessory?: any;
}

export interface MessageFooter extends React.ComponentClass<MessageFooterProps, any> {
    defaultProps: {
        compact: false;
        renderEmbeds: true;
    };
}

export const MessageFooter: MessageFooter = /* @__PURE__ */ Finder.byProtos(["renderRemoveAttachmentConfirmModal"], {entries: true});
