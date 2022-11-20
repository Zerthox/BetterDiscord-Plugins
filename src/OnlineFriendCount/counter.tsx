import {Finder, React, Flux, Styles} from "dium";
import {GuildStore, PresenceStore, RelationshipStore, RelationshipTypes, StatusTypes, classNames} from "@dium/modules";
import {Link} from "@dium/components";
import {Settings, CounterType, counterLabels} from "./settings";
import {CountContextMenu} from "./context-menu";

const styles = Styles.suffix("container", "item", "link", "counter", "guilds", "friends", "friendsOnline", "pending", "blocked");

const listStyles = Finder.byProps(["listItem"]);

interface ItemProps {
    children?: React.ReactNode;
    className?: string;
    link?: string;
}

const Item = ({children, className, link}: ItemProps) => (
    <div className={listStyles.listItem}>{link ? (
        <Link
            to={link}
            className={classNames(styles.item, styles.link, className)}
        >{children}</Link>
    ) : (
        <div className={classNames(styles.link, className)}>{children}</div>
    )}</div>
);

const CounterItem = ({type, count}: Counter) => (
    <Item
        link="/channels/@me"
        className={classNames(styles.counter, styles[type])}
    >{count} {counterLabels[type].label}</Item>
);

const countFilteredRelationships = (filter: (relationship: {id: string; type: RelationshipTypes}) => boolean): number => (
    Object.entries(RelationshipStore.getRelationships()).filter(([id, type]) => filter({id, type})).length
);

interface Counter {
    type: CounterType;
    count: number;
}

const useCounters = (): Counter[] => {
    const guilds = Flux.useStateFromStores([GuildStore], () => GuildStore.getGuildCount(), []);
    const friendsOnline = Flux.useStateFromStores([PresenceStore, RelationshipStore], () => countFilteredRelationships(
        ({id, type}) => type === RelationshipTypes.FRIEND && PresenceStore.getStatus(id) !== StatusTypes.OFFLINE
    ), []);
    const relationships = Flux.useStateFromStores([RelationshipStore], () => ({
        friends: countFilteredRelationships(({type}) => type === RelationshipTypes.FRIEND),
        pending: countFilteredRelationships(({type}) => type === RelationshipTypes.PENDING_INCOMING || type === RelationshipTypes.PENDING_OUTGOING),
        blocked: countFilteredRelationships(({type}) => type === RelationshipTypes.BLOCKED)
    }), []);

    return Object.entries({guilds, friendsOnline, ...relationships})
        .map(([type, count]) => ({type, count} as Counter));
};

export const CountersContainer = (): JSX.Element => {
    const {interval, ...settings} = Settings.useCurrent();
    const counters = useCounters().filter(({type}) => settings[type]);
    const [current, setCurrent] = React.useState(0);

    const callback = React.useRef<() => void>();
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
        <div
            className={styles.container}
            onContextMenu={(event) => BdApi.ContextMenu.open(event, CountContextMenu)}
        >
            {counters.length > 0 ? (
                interval ? (
                    <CounterItem {...counters[current]}/>
                ) : counters.map((counter) => <CounterItem key={counter.type} {...counter}/>)
            ) : (
                <Item>-</Item>
            )}
        </div>
    );
};
