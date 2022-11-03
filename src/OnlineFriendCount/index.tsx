import {createPlugin, Logger, Finder, Patcher, Utils, React} from "dium";
import {GuildsNav} from "@dium/components";
import {Settings} from "./settings";
import {CountContainer} from "./count";
import styles from "./styles.scss";

const guildStyles = Finder.byProps(["guilds", "base"]);
const treeStyles = Finder.byProps(["tree", "scroller"]);

const triggerRerender = async () => {
    const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
    const fiber = Utils.getFiber(node);
    if (await Utils.forceFullRerender(fiber)) {
        Logger.log("Rerendered guilds");
    } else {
        Logger.warn("Unable to rerender guilds");
    }
};

export default createPlugin({
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
                children.splice(homeButtonIndex + 1, 0, <CountContainer/>);
            });
        }, {name: "GuildsNav"});

        triggerRerender();
    },
    stop() {
        triggerRerender();
    },
    styles,
    Settings
});
