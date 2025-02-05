import {React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text, IconArrow} from "@dium/components";
import {Settings} from "./settings";
import styles from "./styles.module.scss";

export const enum AccessoryType {
    Embed = "embed",
    MediaItem = "mediaItem",
    MediaItemSingle = "mediaItemSingle",
    Attachment = "attachment"
}

export interface HiderProps {
    placeholders: string[];
    type: AccessoryType;
    children: React.ReactNode;
    id?: string;
}

export const Hider = ({placeholders, type, children, id}: HiderProps): JSX.Element => {
    React.useEffect(() => {
        if (id && !Settings.current.collapsedStates[id]) {
            // Only create initial state if it doesn't exist yet
            const newStates = {
                ...Settings.current.collapsedStates,
                [id]: {
                    collapsed: Settings.current.hideByDefault,
                    lastSeen: Date.now()
                }
            };
            Settings.update({
                ...Settings.current,
                collapsedStates: newStates
            });
        }
    }, [id]);

    const [shown, setShown] = React.useState(() => {
        if (id && id in Settings.current.collapsedStates) {
            return !Settings.current.collapsedStates[id].collapsed;
        }
        return !Settings.current.hideByDefault;
    });

    const toggleShown = React.useCallback(() => {
        const newShown = !shown;
        setShown(newShown);
        if (id) {
            const newStates = {
                ...Settings.current.collapsedStates,
                [id]: {
                    collapsed: !newShown,
                    lastSeen: Date.now()
                }
            };
            Settings.update({
                ...Settings.current,
                collapsedStates: newStates
            });
        }
    }, [shown, id]);

    Settings.useListener(({hideByDefault, collapsedStates}) => {
        if (id && id in collapsedStates) {
            setShown(!collapsedStates[id].collapsed);
        } else {
            setShown(!hideByDefault);
        }
    }, [id]);

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
                onClick={toggleShown}
            >
                <IconArrow
                    color="currentColor"
                    className={classNames(styles.icon, shown ? styles.open : null)}
                />
            </Clickable>
        </Flex>
    );
};
