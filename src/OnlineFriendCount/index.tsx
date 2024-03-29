import {createPlugin, Logger, Finder, Patcher, Utils, React, Filters} from "dium";
import {GuildsNav} from "@dium/components";
import {Settings} from "./settings";
import {CountersContainer} from "./counter";
import {css} from "./styles.module.scss";

const guildStyles = Finder.byKeys(["guilds", "base"]);
const treeStyles = Finder.byKeys(["tree", "scroller"]);

const triggerRerender = async () => {
    const node = document.getElementsByClassName(guildStyles.guilds)?.[0];
    const fiber = Utils.getFiber(node);
    if (await Utils.forceFullRerender(fiber)) {
        Logger.log("Rerendered guilds");
    } else {
        Logger.warn("Unable to rerender guilds");
    }
};

const homeButtonFilter = Filters.bySource(".getPendingCount");

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

                // insert after home button or default to position 2
                const {children} = scroller.props as {children: JSX.Element[]};
                const homeButtonIndex = children.findIndex((child) => homeButtonFilter(child?.type));
                const index = homeButtonIndex > -1 ? homeButtonIndex + 1 : 2;
                children.splice(index, 0, <CountersContainer/>);
            });
        }, {name: "GuildsNav"});

        triggerRerender();
    },
    stop() {
        triggerRerender();
    },
    styles: css,
    Settings
});
