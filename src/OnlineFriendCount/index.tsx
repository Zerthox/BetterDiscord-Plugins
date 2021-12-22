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

const ConnectedOnlineCount = Flux.default.connectStores(
    [Status, Relationships],
    () => {
        const {RelationshipTypes, StatusTypes} = Constants;
        const filtered = Object.entries(Relationships.getRelationships())
            .filter(([id, type]) => type === RelationshipTypes.FRIEND && Status.getStatus(id) !== StatusTypes.OFFLINE);
        return {online: filtered.length};
    }
)(OnlineCount);

export default createPlugin({...config, styles}, ({Logger, Patcher}) => {
    const triggerRerender = async () => {
        const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
        const fiber = Utils.getFiber(node);
        if (await Utils.forceFullRerender(fiber)) {
            Logger.log("Rerendered guilds");
        } else {
            Logger.warn("Unable to rerender guilds");
        }
    };

    return {
        start() {
            Patcher.instead(HomeButton, "HomeButton", ({original: HomeButton, args: [props]}) => (
                <>
                    <HomeButton {...props}/>
                    <ConnectedOnlineCount/>
                </>
            ));

            triggerRerender();
        },
        stop() {
            triggerRerender();
        }
    };
});
