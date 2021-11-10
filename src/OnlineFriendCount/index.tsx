import {createPlugin, Finder, Utils, React, Flux} from "discordium";
import config from "./config.json";
import styles from "./styles.scss";

const Constants = Finder.byProps("Permissions", "RelationshipTypes");
const Status = Finder.byProps("getState", "getStatus", "isMobileOnline");
const Relationships = Finder.byProps("isFriend", "getRelationshipCount");

const HomeButton = Finder.byProps("HomeButton");
const {Link} = Finder.byProps("Link", "NavLink") ?? {};

const guildStyles = Finder.byProps("guilds", "base");
const listStyles = Finder.byProps("listItem");
const friendsOnline = "friendsOnline-2JkivW";

interface OnlineCountProps {
    online: number;
}

const OnlineCount = ({online}: OnlineCountProps) => (
    <div className={listStyles.listItem}>
        <Link to={{pathname: "/channels/@me"}}>
            <div className={friendsOnline}>{online} Online</div>
        </Link>
    </div>
);

const ConnectedOnlineCount = Flux.connectStores(
    [Status, Relationships],
    () => {
        const {RelationshipTypes, StatusTypes} = Constants;
        const filtered = Object.entries(Relationships.getRelationships())
            .filter(([id, type]) => type === RelationshipTypes.FRIEND && Status.getStatus(id) !== StatusTypes.OFFLINE);
        return {online: filtered.length};
    }
)(OnlineCount);

export default createPlugin({...config, styles}, ({Logger, Patcher}) => {
    const triggerRerender = () => {
        const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
        const fiber = Utils.getFiber(node);
        const owner = Utils.findOwner(fiber);
        if (owner) {
            // nuke rendered elements in next render
            const {stateNode} = owner;
            Patcher.after(stateNode, "render", () => null, {once: true});

            // trigger rerender twice
            stateNode.forceUpdate(() => stateNode.forceUpdate());
            Logger.log("Triggered guilds rerender");
        } else {
            Logger.warn("Unable to find guilds owner");
        }
    };

    return {
        start() {
            Patcher.instead(HomeButton, "HomeButton", ({original: HomeButton, args: [props]}) => {
                Logger.log("render");
                return (
                    <>
                        <HomeButton {...props}/>
                        <ConnectedOnlineCount/>
                    </>
                );
            });

            triggerRerender();
        },
        stop() {
            triggerRerender();
        }
    };
});
