import {createPlugin, Filters, Finder, PatchDataWithResult, Patcher, React, Utils} from "dium";
import {Message, Attachment} from "@dium/modules";
import {FormSwitch, MessageFooter, Embed, MediaItemProps} from "@dium/components";
import {Settings, cleanupOldEntries} from "./settings";
import {Hider, AccessoryType} from "./hider";
import {css} from "./styles.module.scss";

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

interface MediaModule {
    MediaItem: React.FunctionComponent<MediaItemProps>;
}

const MediaModule: MediaModule = Finder.demangle({
    MediaItem: Filters.bySource("getObscureReason", "isSingleMosaicItem")
}, null, true);

export default createPlugin({
    start() {
        // Run cleanup on start
        cleanupOldEntries();
        
        Patcher.after(Embed.prototype as InstanceType<typeof Embed>, "render", ({result, context}) => {
            const {embed} = context.props;
            const placeholder = embed.provider?.name ?? embed.author?.name ?? embed.rawTitle ?? new URL(embed.url).hostname;
            return (
                <Hider
                    type={AccessoryType.Embed}
                    placeholders={[placeholder]}
                    id={embed.url}
                >{result}</Hider>
            );
        }, {name: "Embed render"});

        Patcher.after(MediaModule, "MediaItem", ({args: [props], result}) => {
            const attachment = props.item.originalItem;
            const placeholder = attachment.filename ?? new URL(attachment.url).hostname;
            return (
                <Hider
                    type={props.isSingleMosaicItem ? AccessoryType.MediaItemSingle : AccessoryType.MediaItem}
                    placeholders={[placeholder]}
                    id={attachment.url}
                >{result}</Hider>
            );
        }, {name: "MediaItem render"});

        Patcher.after(MessageFooter.prototype, "renderAttachments", ({result}: PatchDataWithResult<JSX.Element>) => {
            for (const element of Utils.queryTreeAll(result, (node) => node?.props?.attachments)) {
                Utils.hookFunctionComponent<AttachmentsProps>(element, (result, {attachments}) => {
                    const placeholders = attachments.map(({attachment}) => attachment.filename ?? new URL(attachment.url).hostname);
                    const id = attachments[0]?.attachment?.url;
                    return (
                        <Hider
                            type={AccessoryType.Attachment}
                            placeholders={placeholders}
                            id={id}
                        >{result}</Hider>
                    );
                });
            }
        }, {name: "MessageFooter renderAttachments"});
    },
    stop() {
        // Run cleanup on stop
        cleanupOldEntries();
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{hideByDefault}, setSettings] = Settings.useState();

        return (
            <FormSwitch
                note="Collapse all embeds &amp; attachments initially."
                hideBorder
                value={hideByDefault}
                onChange={(checked) => setSettings({hideByDefault: checked})}
            >Collapse by default</FormSwitch>
        );
    }
});
