import {createPlugin, Finder, Utils, React, Flux, Modules} from "discordium";
import config from "./config.json";
import styles from "./styles.scss";

const {RelationshipTypes, StatusTypes} = Modules.Constants;
const Status = Finder.byProps("getState", "getStatus", "isMobileOnline");
const Relationships = Finder.byProps("isFriend", "getRelationshipCount");

const HomeButton = Finder.byProps("HomeButton");
const {Link} = Finder.byProps("Link", "NavLink") ?? {};

const guildStyles = Finder.byProps("guilds", "base");
const listStyles = Finder.byProps("listItem");
const friendsOnline = "friendsOnline-2JkivW";

const OnlineCount = () => {
    const online = Flux.useStateFromStores([Status, Relationships], () => (
        Object.entries(Relationships.getRelationships())
            .filter(([id, type]) => type === RelationshipTypes.FRIEND && Status.getStatus(id) !== StatusTypes.OFFLINE)
            .length
    ));

    return (
        <div className={listStyles.listItem}>
            <Link to={{pathname: "/channels/@me"}}>
                <div className={friendsOnline}>{online} Online</div>
            </Link>
        </div>
    );
};

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
                    <OnlineCount/>
                </>
            ));

            triggerRerender();
        },
        stop() {
            triggerRerender();
        }
    };
});
