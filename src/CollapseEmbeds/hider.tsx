import { React } from "dium";
import { classNames } from "@dium/modules";
import { Flex, Clickable, Text, IconArrow } from "@dium/components";
import { getCollapsedState, updateCollapsedState } from "./settings";
import styles from "./styles.module.scss";

export const enum AccessoryType {
    Embed = "embed",
    MediaItem = "mediaItem",
    MediaItemSingle = "mediaItemSingle",
    Attachment = "attachment",
}

export interface HiderProps {
    placeholders: string[];
    type: AccessoryType;
    children: React.ReactNode;
    id?: string;
}

export const Hider = ({ placeholders, type, children, id }: HiderProps): React.JSX.Element => {
    const [shown, setShown] = React.useState(() => getCollapsedState(id));

    // refresh saved when id changes
    React.useEffect(() => updateCollapsedState(id, shown), [id]);

    const toggleShown = React.useCallback(() => {
        setShown(!shown);
        updateCollapsedState(id, !shown);
    }, [id, shown]);

    return (
        <Flex
            align={Flex.Align.CENTER}
            className={classNames(styles.container, styles[type], shown ? styles.expanded : styles.collapsed)}
        >
            {shown
                ? children
                : placeholders.filter(Boolean).map((placeholder, i) => (
                      <Text key={i} variant="text-xs/normal" className={styles.placeholder}>
                          {placeholder}
                      </Text>
                  ))}
            <Clickable className={styles.hideButton} onClick={toggleShown}>
                <IconArrow color="currentColor" className={classNames(styles.icon, shown ? styles.open : null)} />
            </Clickable>
        </Flex>
    );
};
