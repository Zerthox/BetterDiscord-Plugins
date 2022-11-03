import {Finder, React, Flux} from "dium";
import {GuildStore, PresenceStore, RelationshipStore, RelationshipTypes, StatusTypes, classNames} from "@dium/modules";
import {Link} from "@dium/components";
import {Settings} from "./settings";
import {CountContextMenu} from "./context-menu";

const listStyles = Finder.byProps(["listItem"]);

interface CountProps {
    children: React.ReactNode;
    className: string;
    link?: string;
}

const Count = ({children, className, link}: CountProps) => (
    <div className={listStyles.listItem}>{link ? (
        <Link
            to={link}
            className={classNames("counter-onlineFriendCount", "link-onlineFriendCount", className)}
        >{children}</Link>
    ) : (
        <div className={classNames("counter-onlineFriendCount", className)}>{children}</div>
    )}</div>
);

const GuildCount = () => {
    const count = Flux.useStateFromStores([GuildStore], () => GuildStore.getGuildCount(), []);
    return <Count className="guilds-onlineFriendCounter">{count} Servers</Count>;
};

const countFilteredRelationships = (filter: (relationship: {id: string; type: RelationshipTypes}) => boolean): number => (
    Object.entries(RelationshipStore.getRelationships()).filter(([id, type]) => filter({id, type})).length
);

const FriendCount = () => {
    const count = Flux.useStateFromStores([RelationshipStore], () => countFilteredRelationships(
        ({type}) => type === RelationshipTypes.FRIEND
    ), []);
    return <Count className="friends-onlineFriendCounter" link="/channels/@me">{count} Friends</Count>;
};

const OnlineFriendCount = () => {
    const count = Flux.useStateFromStores([PresenceStore, RelationshipStore], () => countFilteredRelationships(
        ({id, type}) => type === RelationshipTypes.FRIEND && PresenceStore.getStatus(id) !== StatusTypes.OFFLINE
    ), []);
    return <Count className="friendsOnline-onlineFriendCounter" link="/channels/@me">{count} Online</Count>;
};

const PendingCount = () => {
    const count = Flux.useStateFromStores([RelationshipStore], () => countFilteredRelationships(
        ({type}) => type === RelationshipTypes.PENDING_INCOMING || type === RelationshipTypes.PENDING_OUTGOING
    ), []);
    return <Count className="pending-onlineFriendCount" link="/channels/@me">{count} Pending</Count>;
};

const BlockedCount = () => {
    const count = Flux.useStateFromStores([RelationshipStore], () => countFilteredRelationships(
        ({type}) => type === RelationshipTypes.BLOCKED
    ), []);
    return <Count className="pending-onlineFriendCount" link="/channels/@me">{count} Blocked</Count>;
};

export const CountContainer = (): JSX.Element => {
    const {guilds, friends, friendsOnline, pending, blocked} = Settings.useCurrent();

    return (
        <div
            className="container-onlineFriendCount"
            onContextMenu={(event) => BdApi.ContextMenu.open(event, CountContextMenu)}
        >
            {guilds ? <GuildCount/> : null}
            {friends ? <FriendCount/> : null}
            {friendsOnline ? <OnlineFriendCount/> : null}
            {pending ? <PendingCount/> : null}
            {blocked ? <BlockedCount/> : null}
        </div>
    );
};
