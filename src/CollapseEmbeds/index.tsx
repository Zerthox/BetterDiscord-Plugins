import { createPlugin, Filters, Finder, PatchDataWithResult, Patcher, React, Utils } from "dium";
import { Message, Attachment } from "@dium/modules";
import { MessageFooter, Embed, MediaItemProps, MessageFooterFilter, MediaItemFilter } from "@dium/components";
import { Settings, cleanupOldEntries } from "./settings";
import { SettingsPanel } from "./settings-panel";
import { Hider, AccessoryType } from "./hider";
import { css } from "./styles.module.scss";

interface AttachmentsProps extends Record<string, any> {
    attachments: AttachmentProps[];
}

interface AttachmentProps extends Record<string, any> {
    attachment: Attachment;
    message: Message;
    className: string;
    canRemoveAttachment: boolean;
    inlineMedia: boolean;
    autoPlayGif: boolean;
}

type MediaModule = Record<string, React.FunctionComponent<MediaItemProps>>;

export default createPlugin({
    start() {
        // Run cleanup on start
        cleanupOldEntries();

        Patcher.after(
            Embed.prototype as InstanceType<typeof Embed>,
            "render",
            ({ result, context }) => {
                const { embed } = context.props;
                const placeholder =
                    embed.provider?.name
                    ?? embed.author?.name
                    ?? embed.rawTitle
                    ?? (embed.url ? new URL(embed.url).hostname : "Embed");
                return (
                    <Hider type={AccessoryType.Embed} placeholders={[placeholder]} id={embed.url}>
                        {result}
                    </Hider>
                );
            },
            { name: "Embed render" },
        );

        Finder.waitForChecked(Filters.byEntry(MediaItemFilter), {}, (mediaModule: MediaModule) => {
            const MediaItem = Finder.resolveKey(mediaModule, MediaItemFilter);
            Patcher.after(
                ...MediaItem,
                ({ args: [props], result }) => {
                    const attachment = props.item.originalItem;
                    const placeholder = attachment.filename ?? new URL(attachment.url ?? "").hostname;
                    return (
                        <Hider
                            type={props.isSingleMosaicItem ? AccessoryType.MediaItemSingle : AccessoryType.MediaItem}
                            placeholders={[placeholder]}
                            id={attachment.url}
                        >
                            {result as React.ReactNode}
                        </Hider>
                    );
                },
                { name: "MediaItem render" },
            );
        });

        Finder.waitForChecked(MessageFooterFilter, { entries: true }, (MessageFooter: MessageFooter) => {
            Patcher.after(
                MessageFooter.prototype,
                "renderAttachments",
                ({ result }: PatchDataWithResult<() => React.JSX.Element>) => {
                    for (const element of Utils.queryTreeAll(result, (node) => node?.props?.attachments)) {
                        Utils.hookFunctionComponent<AttachmentsProps>(element, (result, { attachments }) => {
                            const placeholders = attachments.map(
                                ({ attachment }) => attachment.filename ?? new URL(attachment.url ?? "").hostname,
                            );
                            const id = attachments[0]?.attachment?.url;
                            return (
                                <Hider type={AccessoryType.Attachment} placeholders={placeholders} id={id}>
                                    {result}
                                </Hider>
                            );
                        });
                    }
                },
                { name: "MessageFooter renderAttachments" },
            );
        });
    },
    stop() {
        // Run cleanup on stop
        cleanupOldEntries();
    },
    styles: css,
    Settings,
    SettingsPanel,
});
