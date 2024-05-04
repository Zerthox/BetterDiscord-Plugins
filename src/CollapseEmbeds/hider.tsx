import {React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text, IconArrow} from "@dium/components";
import {Settings} from "./settings";
import styles from "./styles.module.scss";

export const enum AccessoryType {
    Embed = "embed",
    MediaItem = "mediaItem",
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
                <IconArrow
                    color="currentColor"
                    className={classNames(styles.icon, shown ? styles.open : null)}
                />
            </Clickable>
        </Flex>
    );
};
