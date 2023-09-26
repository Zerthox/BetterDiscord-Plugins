import {Finder, React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text} from "@dium/components";
import {Settings} from "./settings";
import styles from "./styles.module.scss";

const Arrow = Finder.bySource(["d:\"m6 10"], {entries: true});

export const enum AccessoryType {
    Embed = "embed",
    Attachment = "attachment"
}

export interface HiderProps {
    placeholders: string[];
    type: AccessoryType;
    children: React.ReactNode;
}

export const Hider = ({placeholders, type, children}: HiderProps): JSX.Element => {
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
            {shown ? children : placeholders.filter(Boolean).map((placeholder, i) => (
                <Text key={i} variant="text-xs/normal" className={styles.placeholder}>{placeholder}</Text>
            ))}
            <Clickable
                className={styles.hideButton}
                onClick={() => setShown(!shown)}
            >
                <Arrow className={classNames(styles.icon, shown ? styles.open : null)}/>
            </Clickable>
        </Flex>
    );
};
