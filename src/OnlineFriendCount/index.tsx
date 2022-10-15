import {createPlugin, Finder, Utils, React, Flux} from "dium";
import {PresenceStore, RelationshipStore, RelationshipTypes, StatusTypes} from "@dium/modules";
import {Link} from "@dium/components";
import styles from "./styles.scss";

const GuildsNav = Finder.bySource(["guildsnav"], {entries: true}) as React.MemoExoticComponent<React.FunctionComponent<any>>;

const guildStyles = Finder.byProps(["guilds", "base"]);
const treeStyles = Finder.byProps(["tree", "scroller"]);
const listStyles = Finder.byProps(["listItem"]);
const friendsOnline = "friendsOnline-2JkivW";

const OnlineCount = () => {
    const online = Flux.useStateFromStores([PresenceStore, RelationshipStore], () => (
        Object.entries(RelationshipStore.getRelationships())
            .filter(([id, type]) => type === RelationshipTypes.FRIEND && PresenceStore.getStatus(id) !== StatusTypes.OFFLINE)
            .length
    ));

    return (
        <div className={listStyles.listItem}>
            <Link to="/channels/@me">
                <div className={friendsOnline}>{online} Online</div>
            </Link>
        </div>
    );
};

export default createPlugin({styles}, ({Logger, Patcher}) => {
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
            // patch guilds nav
            Patcher.after(GuildsNav, "type", ({result}) => {
                const target = Utils.queryTree(result, (node) => node?.props?.className?.split(" ").includes(guildStyles.guilds));
                if (!target) {
                    return Logger.error("Unable to find chain patch target");
                }

                // chain patch into the component
                Utils.hookFunctionComponent(target, (result) => {
                    // find scroller
                    const scroller = Utils.queryTree(result, (node) => node?.props?.className?.split(" ").includes(treeStyles.scroller));
                    if (!scroller) {
                        return Logger.error("Unable to find scroller");
                    }

                    // insert after home button
                    const {children} = scroller.props as {children: JSX.Element[]};
                    const homeButtonIndex = children.findIndex((child) => typeof child?.props?.isOnOtherSidebarRoute === "boolean");
                    children.splice(homeButtonIndex + 1, 0, <OnlineCount/>);
                });
            });

            triggerRerender();
        },
        stop() {
            triggerRerender();
        }
    };
});
