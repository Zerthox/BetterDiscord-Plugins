import {Finder} from "../api";
import {Attachment, Channel, Message} from "../modules";

export interface MessageFooterProps {
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

export interface MediaItemProps extends Record<string, any> {
    mediaLayoutType: string;
    isSingleMosaicItem: boolean;
    maxWidth: number;
    maxHeight: number;
    message: Message;
    item: {
        uniqueId: string;
        type: string;
        contentType: string;
        height: number;
        width: number;
        downloadUrl: string;
        originalItem: Attachment;
        spoiler: boolean;
    };
    useFullWidth: boolean;
    canRemoveItem: boolean;
    autoPlayGif: boolean;
    className: string;
    imgClassName: string;
    imgContainerClassName: string;
    footer?: any;
    onClick();
    onPlay();
    onRemoveItem();
    renderAudioComponent(): any;
    renderGenericFileComponent(): any;
    renderImageComponent(): any;
    renderMosaicItemFooter(): any;
    renderPlaintextFilePreview(): any;
    renderVideoComponent(): any;
    getObscureReason(): any;
    gifFavoriteButton(): any;
}

export const MediaItem: React.FunctionComponent<MediaItemProps> = /* @__PURE__ */ Finder.bySource(["getObscureReason", "isSingleMosaicItem"]);
