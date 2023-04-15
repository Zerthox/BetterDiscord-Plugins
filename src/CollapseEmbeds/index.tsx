import {createPlugin, PatchDataWithResult, Patcher, React, Utils} from "dium";
import {Message, Attachment} from "@dium/modules";
import {FormSwitch, MessageFooter, Embed} from "@dium/components";
import {Settings} from "./settings";
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

export default createPlugin({
    start() {
        Patcher.after(Embed.prototype as InstanceType<typeof Embed>, "render", ({result, context}) => {
            const {embed} = context.props;
            const placeholder = embed.provider?.name ?? embed.author?.name ?? embed.rawTitle ?? new URL(embed.url).hostname;
            return (
                <Hider
                    type={AccessoryType.Embed}
                    placeholders={[placeholder]}
                >{result}</Hider>
            );
        }, {name: "Embed render"});

        Patcher.after(MessageFooter.prototype, "renderAttachments", ({result}: PatchDataWithResult<JSX.Element>) => {
            for (const element of Utils.queryTreeAll(result, (node) => node?.props?.attachments)) {
                Utils.hookFunctionComponent<AttachmentsProps>(element, (result, {attachments}) => {
                    return (
                        <Hider
                            type={AccessoryType.Attachment}
                            placeholders={attachments.map(({attachment}) => attachment.filename ?? new URL(attachment.url).hostname)}
                        >{result}</Hider>
                    );
                });
            }
        }, {name: "MessageFooter renderAttachments"});
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
