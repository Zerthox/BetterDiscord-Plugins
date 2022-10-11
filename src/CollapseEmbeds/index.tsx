import {createPlugin, Finder, React} from "dium";
import {classNames} from "dium/modules";
import {Flex, Clickable, Text, SwitchItem} from "dium/components";
import styles from "./styles.scss";

const Embed = Finder.byName("Embed") as typeof React.Component<any, any>;
const MessageAttachment = Finder.byName("MessageAttachment", {resolve: false}) as {default: React.FunctionComponent<any>};
const ArrowDropDown = Finder.byName("ArrowDropDown") as React.FunctionComponent<any>;
const ArrowDropUp = Finder.byName("ArrowDropUp") as React.FunctionComponent<any>;

const settings = {
    hideByDefault: false
};

const enum AccessoryType {
    Embed = "embed",
    Attachment = "attachment"
}

export default createPlugin({styles, settings}, ({Patcher, Settings}) => {
    interface HiderProps {
        placeholder: string;
        type: AccessoryType;
        marginCorrect?: boolean;
        children: React.ReactNode;
    }

    const typeClasses = {
        [AccessoryType.Embed]: "collapseEmbeds-embed",
        [AccessoryType.Attachment]: "collapseEmbeds-attachment"
    };
    const iconClass = "collapseEmbeds-icon";

    const Hider = ({placeholder, type, marginCorrect, children}: HiderProps): JSX.Element => {
        const {hideByDefault} = Settings.useCurrent();
        const [shown, setShown] = React.useState(!hideByDefault);

        Settings.useListener(({hideByDefault}) => setShown(!hideByDefault));

        return (
            <Flex
                align={Flex.Align.CENTER}
                className={classNames(
                    "collapseEmbeds-container",
                    typeClasses[type],
                    `collapseEmbeds-${shown ? "expanded" : "collapsed"}`
                )}
            >
                <div className="collapseEmbeds-content">
                    {shown ? children : <Text variant="text-xs/normal">{placeholder}</Text>}
                </div>
                <Clickable
                    className={classNames(
                        "collapseEmbeds-hideButton",
                        {["collapseEmbeds-marginCorrect"]: marginCorrect}
                    )}
                    onClick={() => setShown(!shown)}
                >
                    {shown ? <ArrowDropUp className={iconClass}/> : <ArrowDropDown className={iconClass}/>}
                </Clickable>
            </Flex>
        );
    };

    return {
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
    };
});
