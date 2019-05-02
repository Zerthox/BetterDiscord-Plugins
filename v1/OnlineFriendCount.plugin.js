//META {"name": "OnlineFriendCount", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/OnlineFriendCount.plugin.js"} *//

/**
 * @author Zerthox
 * @version 1.0.4
 * @return {class} OnlineFriendCount plugin class
 */
const OnlineFriendCount = (() => {

    // Api constants
    const {React} = BdApi;

    /**
     * module storage
     */
    const Module = {
        status: BdApi.findModuleByProps("getStatus", "getOnlineFriendCount"),
        guilds: BDV2.WebpackModules.findByDisplayName("Guilds")
    };

    /**
     * selector storage
     */
    const Selector = {
        guildsWrapper: BdApi.findModuleByProps("wrapper", "unreadMentionsBar"),
        guilds: BdApi.findModuleByProps("listItem", "friendsOnline")
    };

    /**
     * storage for patches
     */
    const Patches = {};

    // return plugin class
    return class OnlineFriendCount {

        /**
         * @return {string} plugin name
         */
        getName() {
            return "OnlineFriendCount";
        }
        
        /**
         * @return {*} plugin description
         */
        getDescription() {
            return React.createElement("span", {"white-space": "pre-line"},
                "Add the old online friend count back to guild list. Because nostalgia."
            );
        }
        
        /**
         * @return {string} plugin version
         */
        getVersion() {
            return "1.0.4";
        }
        
        /**
         * @return {*} plugin author
         */
        getAuthor() {
            return React.createElement("a", {href: "https://github.com/Zerthox", target: "_blank"}, "Zerthox");
        }
        
        /**
         * plugin start function
         */
        start() {
            
            // patch guilds render function
            Patches.guilds = BdApi.monkeyPatch(Module.guilds.prototype, "render", {after: (d) => {

                // get return value
                const r = d.returnValue;

                // find scroller
                const l = r.props.children.find((e) => e.type && e.type.displayName === "VerticalScroller").props.children;

                // check if online friends count is not inserted yet
                if (!l.find((e) => e.props && e.props.children && e.props.children.props && e.props.children.props.className === Selector.guilds.friendsOnline)) {

                    // insert online friends count before dms
                    l.splice(l.indexOf(l.find((e) => e.type && e.type.displayName === "TransitionGroup")), 0,
                        React.createElement("div", {className: Selector.guilds.listItem},
                            React.createElement("div", {className: Selector.guilds.friendsOnline, style: {"margin": 0}}, `${Module.status.getOnlineFriendCount()} Online`)
                        )
                    );
                }

                // return modified return value
                return r;
            }});
            
            // force update
            this.forceUpdateAll();
            
            // console output
            console.log(`%c[${this.getName()}]%c v${this.getVersion()} enabled`, "color: #3a71c1; font-weight: 700;", "");
        }
        
        /**
         * plugin stop function
         */
        stop() {

            // revert all patches
            for (const k in Patches) {
                Patches[k]();
                delete Patches[k];
            }

            // force update
            this.forceUpdateAll();

            // console output
            console.log(`%c[${this.getName()}]%c v${this.getVersion()} disabled`, "color: #3a71c1; font-weight: 700;", "");
        }


        /**
         * force update guild list
         */
        forceUpdateAll() {

            // force update guilds wrapper
            for (const e of document.getElementsByClassName(Selector.guildsWrapper.wrapper)) {
                const i = BdApi.getInternalInstance(e);
                i && i.return.stateNode.forceUpdate();
            }
        }

    }
})();