import {React} from "dium";
import {classNames} from "@dium/modules";
import {Flex, Clickable, Text, IconArrow} from "@dium/components";
import {Settings, cleanupOldEntries} from "./settings";
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
    // Update lastSeen timestamp on mount and track component mounted state
    const mounted = React.useRef(true);

    React.useEffect(() => {
        mounted.current = true;
        
        if (id) {
            const state = Settings.current.collapsedStates[id];
            if (state) {
                const newStates = {
                    ...Settings.current.collapsedStates,
                    [id]: { ...state, lastSeen: Date.now() }
                };
                Settings.update({
                    ...Settings.current,
                    collapsedStates: newStates
                });
            }
        }

        return () => {
            mounted.current = false;
        };
    }, [id]);

    const [shown, setShown] = React.useState(() => {
        if (!id) return !Settings.current.hideByDefault;
        return !Settings.current.collapsedStates[id]?.collapsed;
    });

    const toggleShown = React.useCallback(() => {
        if (!mounted.current) return;
        
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

    // Update shown state when settings change
    Settings.useListener(({hideByDefault, collapsedStates}) => {
        if (!mounted.current) return;
        
        if (!id) {
            setShown(!hideByDefault);
        } else if (collapsedStates[id]) {
            setShown(!collapsedStates[id].collapsed);
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
