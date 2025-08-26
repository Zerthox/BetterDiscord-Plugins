import { Finder, React, Flux } from "dium";
import { GuildStore, PresenceStore, RelationshipStore, StatusTypes, classNames } from "@dium/modules";
import { Link } from "@dium/components";
import { Settings, CounterType, counterLabels } from "./settings";
import { CountContextMenu } from "./context-menu";
import styles from "./styles.module.scss";

const listStyles = Finder.byKeys(["listItem", "iconBadge"]);

interface ItemProps {
    children?: React.ReactNode;
    className?: string;
    link?: string;
}

const Item = ({ children, className, link }: ItemProps) => (
    <div className={listStyles.listItem}>
        {link ? (
            <Link to={link} className={classNames(styles.item, styles.link, className)}>
                {children}
            </Link>
        ) : (
            <div className={classNames(styles.link, className)}>{children}</div>
        )}
    </div>
);

const CounterItem = ({ type, count }: Counter) => (
    <Item link="/channels/@me" className={classNames(styles.counter, styles[type])}>
        {count} {counterLabels[type].label}
    </Item>
);

interface Counter {
    type: CounterType;
    count: number;
}

const useCounters = (): Counter[] =>
    Flux.useStateFromStores([GuildStore, PresenceStore, RelationshipStore], () => [
        { type: CounterType.Guilds, count: GuildStore.getGuildCount() },
        { type: CounterType.Friends, count: RelationshipStore.getFriendCount() },
        {
            type: CounterType.FriendsOnline,
            count: RelationshipStore.getFriendIDs().filter((id) => PresenceStore.getStatus(id) !== StatusTypes.OFFLINE)
                .length,
        },
        { type: CounterType.Pending, count: RelationshipStore.getPendingCount() },
        { type: CounterType.Blocked, count: RelationshipStore.getBlockedIDs().length },
    ]);

export const CountersContainer = (): React.JSX.Element => {
    const { interval, ...settings } = Settings.useCurrent();
    const counters = useCounters().filter(({ type }) => settings[type]);
    const [current, setCurrent] = React.useState(0);

    const callback = React.useRef<() => void>(null);
    React.useEffect(() => {
        callback.current = () => setCurrent((current + 1) % counters.length);
    }, [current, counters.length]);

    React.useEffect(() => {
        // check interval setting & at least 2 counters
        if (interval && counters.length > 1) {
            setCurrent(0);
            const id = setInterval(() => callback.current(), 5000);
            return () => clearInterval(id);
        }
    }, [interval, counters.length]);

    return (
        <div className={styles.container} onContextMenu={(event) => BdApi.ContextMenu.open(event, CountContextMenu)}>
            {counters.length > 0 ? (
                interval ? (
                    <CounterItem {...counters[current]} />
                ) : (
                    counters.map((counter) => <CounterItem key={counter.type} {...counter} />)
                )
            ) : (
                <Item>-</Item>
            )}
        </div>
    );
};
