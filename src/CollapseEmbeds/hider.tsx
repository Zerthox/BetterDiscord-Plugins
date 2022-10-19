import {Finder, React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text} from "@dium/components";
import {Settings} from "./settings";

const ArrowDropDown = Finder.byName("ArrowDropDown") as React.FunctionComponent<any>;
const ArrowDropUp = Finder.byName("ArrowDropUp") as React.FunctionComponent<any>;

export const enum AccessoryType {
    Embed = "embed",
    Attachment = "attachment"
}

export interface HiderProps {
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

export const Hider = ({placeholder, type, marginCorrect, children}: HiderProps): JSX.Element => {
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
