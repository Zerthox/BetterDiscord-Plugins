import {Finder, React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text} from "@dium/components";
import {Settings} from "./settings";

const Arrow = Finder.bySource(["d:\"M16.", (source) => /\.open[,;]/.test(source)]);

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

export const Hider = ({placeholder, type, marginCorrect, children}: HiderProps): JSX.Element => {
    const {hideByDefault} = Settings.useCurrent();
    const [shown, setShown] = React.useState(!hideByDefault);

    Settings.useListener(({hideByDefault}) => setShown(!hideByDefault));

    const button = (
        <Clickable
            className={classNames(
                "collapseEmbeds-hideButton",
                typeClasses[type],
                `collapseEmbeds-${shown ? "expanded" : "collapsed"}`,
                {["collapseEmbeds-marginCorrect"]: marginCorrect}
            )}
            onClick={() => setShown(!shown)}
        >
            <Arrow open={shown} className="collapseEmbeds-icon"/>
        </Clickable>
    );

    return shown ? (
        <>
            {children}
            {button}
        </>
    ) : (
        <Flex
            align={Flex.Align.CENTER}
            className={classNames("collapseEmbeds-placeholder", typeClasses[type])}
        >
            <Text variant="text-xs/normal">{placeholder}</Text>
            {button}
        </Flex>
    );
};
