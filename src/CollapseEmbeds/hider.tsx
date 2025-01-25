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

// Global storage for collapsed states
export const STORAGE_KEY = 'dium-collapsed-states';
export let collapsedStates: Record<string, boolean>;

try {
    const stored = localStorage.getItem(STORAGE_KEY);
    collapsedStates = stored ? JSON.parse(stored) : {};
} catch {
    collapsedStates = {};
}

export interface HiderProps {
    placeholders: string[];
    type: AccessoryType;
    children: React.ReactNode;
    id?: string;
}

export const Hider = ({placeholders, type, children, id}: HiderProps): JSX.Element => {
    const [shown, setShown] = React.useState(() => {
        if (!id) return !Settings.current.hideByDefault;
        return !collapsedStates[id];
    });

    const toggleShown = () => {
        const newShown = !shown;
        setShown(newShown);
        
        if (id) {
            try {
                collapsedStates[id] = !newShown;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedStates));
            } catch {}
        }
    };

    Settings.useListener(({hideByDefault}) => {
        if (!id) setShown(!hideByDefault);
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
