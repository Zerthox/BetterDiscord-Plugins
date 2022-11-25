import {Finder, React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text} from "@dium/components";
import {Settings} from "./settings";
import styles from "./styles.module.scss";

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

export const Hider = ({placeholder, type, marginCorrect, children}: HiderProps): JSX.Element => {
    const [shown, setShown] = React.useState(!Settings.current.hideByDefault);
    Settings.useListener(({hideByDefault}) => setShown(!hideByDefault), []);

    return (
        <Flex
            align={Flex.Align.CENTER}
            className={classNames(
                styles.container,
                styles[type],
                shown ? styles.expanded : styles.collapsed
            )}
        >
            {shown ? children : (
                <Text variant="text-xs/normal" className={styles.placeholder}>{placeholder}</Text>
            )}
            <Clickable
                className={classNames(
                    styles.hideButton,
                    {[styles.marginCorrect]: marginCorrect}
                )}
                onClick={() => setShown(!shown)}
            >
                <Arrow open={shown} className={styles.icon}/>
            </Clickable>
        </Flex>
    );
};
