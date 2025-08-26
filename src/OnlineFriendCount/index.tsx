import { createPlugin, Logger, Finder, Patcher, Utils, React } from "dium";
import { GuildsNav } from "@dium/components";
import { Settings } from "./settings";
import { CountersContainer } from "./counter";
import { css } from "./styles.module.scss";

const guildStyles = Finder.byKeys(["guilds", "base"]);

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
        Patcher.after(
            GuildsNav,
            "type",
            ({ result }) => {
                const guildsParent = Utils.queryTree(result, (node) =>
                    node?.props?.className?.split(" ").includes(guildStyles.guilds),
                );
                if (!guildsParent) {
                    return Logger.error("Unable to find guilds parent");
                }

                // chain patch
                Utils.hookFunctionComponent(guildsParent, (result) => {
                    const themeParent = Utils.queryTree(result, (node) => typeof node?.props?.children === "function");
                    if (!themeParent) {
                        return Logger.error("Unable to find theme parent");
                    }

                    // chain patch again
                    Utils.hookFunctionComponent(themeParent, (result) => {
                        // find home button wrapper & parent
                        const [scroller, index] = Utils.queryTreeForParent(
                            result,
                            (child) => child?.props?.lurkingGuildIds,
                        );
                        if (!scroller) {
                            return Logger.error("Unable to find home button wrapper");
                        }

                        // insert after home button wrapper
                        scroller.props.children.splice(index + 1, 0, <CountersContainer />);
                    });
                });
            },
            { name: "GuildsNav" },
        );

        triggerRerender();
    },
    stop() {
        triggerRerender();
    },
    styles: css,
    Settings,
});
