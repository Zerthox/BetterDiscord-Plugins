import {createPlugin, Finder, Patcher, React} from "dium";
import {SwitchItem} from "@dium/components";
import {Settings} from "./settings";
import {Hider, AccessoryType} from "./hider";
import styles from "./styles.scss";

const Embed = Finder.byName("Embed") as typeof React.Component<any, any>;
const MessageAttachment = Finder.byName("MessageAttachment", {resolve: false}) as {default: React.FunctionComponent<any>};

export default createPlugin({styles, settings: Settings}, () => ({
    start() {
        Patcher.after(Embed.prototype, "render", ({result, context}) => {
            const {embed} = context.props;
            return <Hider type={AccessoryType.Embed} placeholder={embed.provider?.name}>{result}</Hider>;
        });

        Patcher.after(MessageAttachment, "default", ({args: [props], result}) => (
            <Hider
                type={AccessoryType.Attachment}
                placeholder={props.attachment.filename}
                marginCorrect={props.canRemoveAttachment}
            >{result}</Hider>
        ));
    },
    stop() {},
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
}));
