import {createPlugin, PatchDataWithResult, Patcher, React, Utils} from "dium";
import {Attachment} from "@dium/modules";
import {SwitchItem, MessageFooter, Embed} from "@dium/components";
import {Settings} from "./settings";
import {Hider, AccessoryType} from "./hider";
import styles from "./styles.scss";

interface AttachmentProps extends Record<string, any> {
    attachment: Attachment;
    canRemoveAttachment?: boolean;
}

export default createPlugin({
    start() {
        Patcher.after(Embed.prototype as InstanceType<typeof Embed>, "render", ({result, context}) => {
            const {embed} = context.props;
            return (
                <Hider
                    type={AccessoryType.Embed}
                    placeholder={embed.provider?.name}
                >{result}</Hider>
            );
        }, {name: "Embed render"});

        Patcher.after(MessageFooter.prototype, "renderAttachments", ({result}: PatchDataWithResult<JSX.Element>) => {
            const attachments = Utils.queryTreeAll(result, (node) => node?.props?.attachment);
            for (const attachment of attachments) {
                Utils.hookFunctionComponent<AttachmentProps>(
                    attachment,
                    (result, {attachment, canRemoveAttachment}) => (
                        <Hider
                            type={AccessoryType.Attachment}
                            placeholder={attachment.filename}
                            marginCorrect={canRemoveAttachment}
                        >{result}</Hider>
                    ));
            }
        }, {name: "MessageFooter renderAttachments"});
    },
    styles,
    Settings,
    SettingsPanel: () => {
        const [{hideByDefault}, setSettings] = Settings.useState();

        return (
            <SwitchItem
                note="Collapse all embeds &amp; attachments initially."
                hideBorder
                value={hideByDefault}
                onChange={(checked) => setSettings({hideByDefault: checked})}
            >Collapse by default</SwitchItem>
        );
    }
});
