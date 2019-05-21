//META {"name": "OnlineFriendCount", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/OnlineFriendCount.plugin.js"} *//

/**
 * @author Zerthox
 * @version 1.0.6
 * @return {class} OnlineFriendCount plugin class
 */
const OnlineFriendCount = (() => {

	// Api constants
	const {React} = BdApi;

	/** Module storage */
	const Module = {
		Status: BdApi.findModuleByProps("getStatus", "getOnlineFriendCount"),
		Guilds: BdApi.findModule((m) => m.displayName === "Guilds")
	};

	/** Selector storage */
	const Selector = {
		guildsWrapper: BdApi.findModuleByProps("wrapper", "unreadMentionsBar"),
		guilds: BdApi.findModuleByProps("listItem", "friendsOnline")
	};

	/** Storage for Patches */
	const Patches = {};

	// return plugin class
	return class OnlineFriendCount {

		/**
		 * @return {string} Plugin name
		 */
		getName() {
			return "OnlineFriendCount";
		}
		
		/**
		 * @return {string} Plugin description
		 */
		getDescription() {
			return "Add the old online friend count back to guild list. Because nostalgia.";
		}
		
		/**
		 * @return {string} Plugin version
		 */
		getVersion() {
			return "1.0.6";
		}
		
		/**
		 * @return {string} Plugin author
		 */
		getAuthor() {
			return "Zerthox";
		}

		/**
		 * Log a message in Console
		 * @param {string} msg message
		 */
		log(msg) {
			console.log(`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", "");
		}
		
		/**
		 * Plugin start function
		 */
		start() {
			
			// patch guilds render function
			Patches.guilds = BdApi.monkeyPatch(Module.Guilds.prototype, "render", {silent: true, after: (d) => {

				// get return value
				const r = d.returnValue;

				// find scroller
				const l = r.props.children.find((e) => e.type && e.type.displayName === "VerticalScroller").props.children;

				// check if online friends count is not inserted yet
				if (!l.find((e) => e.props && e.props.children && e.props.children.props && e.props.children.props.className === Selector.guilds.friendsOnline)) {
					
					// insert online friends count before dms
					l.splice(l.indexOf(l.find((e) => e.type && e.type.displayName === "TransitionGroup")), 0,
						React.createElement("div", {className: Selector.guilds.listItem},
							React.createElement("div", {className: Selector.guilds.friendsOnline, style: {"margin": 0}}, `${Module.Status.getOnlineFriendCount()} Online`)
						)
					);
				}

				// return modified return value
				return r;
			}});
			this.log("Patched render of Guilds component");
			
			// force update
			this.forceUpdateAll();
			
			// console output
			this.log("Enabled");
		}
		
		/**
		 * Plugin stop function
		 */
		stop() {

			// revert all patches
			for (const k in Patches) {
				Patches[k]();
				delete Patches[k];
			}
			this.log("Unpatched all");

			// force update
			this.forceUpdateAll();

			// console output
			this.log("Disabled");
		}

		/**
		 * Force update the "Guilds" component state nodes
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