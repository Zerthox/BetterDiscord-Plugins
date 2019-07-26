/**
 * @name OnlineFriendCount
 * @author Zerthox
 * @version 1.1.0
 * @description Add the old online friend count back to guild list. Because nostalgia.
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/OnlineFriendCount.plugin.js
 * @return {class} OnlineFriendCount plugin class
 */
const OnlineFriendCount = (() => {

	// Api constants
	const {React} = BdApi,
		Flux = BdApi.findModuleByProps("connectStores");

	/** Module storage */
	const Module = {
		Status: BdApi.findModuleByProps("getStatus", "getOnlineFriendCount")
	};

	/** Component storage */
	const Component = {
		Guilds: BdApi.findModuleByDisplayName("Guilds"),
		Link: BdApi.findModuleByProps("NavLink").Link
	};

	/** Selector storage */
	const Selector = {
		guildsWrapper: BdApi.findModuleByProps("wrapper", "unreadMentionsBar"),
		guilds: BdApi.findModuleByProps("listItem", "friendsOnline")
	};

	/** Storage for Patches */
	const Patches = {};

	// OnlineCount component
	class OnlineCount extends React.Component {
		render() {
			return React.createElement("div", {className: Selector.guilds.listItem},
				React.createElement(Component.Link, {to: {pathname: "/channels/@me"}},
					React.createElement("div", {className: Selector.guilds.friendsOnline, style: {
						margin: 0,
						cursor: "pointer"
					}}, `${this.props.online} Online`)
				)
			);
		}
	}

	// Flux container for OnlineCount component
	const OnlineCountContainer = Flux.connectStores([Module.Status], () => ({online: Module.Status.getOnlineFriendCount()}))(OnlineCount);

	// return plugin class
	return class OnlineFriendCount {

		/**
		 * @return {string} Plugin name
		 */
		getName() {
			return "OnlineFriendCount";
		}
		
		/**
		 * @return {string} Plugin version
		 */
		getVersion() {
			return "1.1.0";
		}
		
		/**
		 * @return {string} Plugin author
		 */
		getAuthor() {
			return "Zerthox";
		}

		/**
		 * @return {string} Plugin description
		 */
		getDescription() {
			return "Add the old online friend count back to guild list. Because nostalgia.";
		}

		/**
		 * Print a message in Console
		 * @param {string} msg message
		 * @param {function} [log=console.log] log function to call
		 */
		log(msg, log = console.log) {
			log(`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", "");
		}
		
		/**
		 * Plugin start function
		 */
		start() {
			
			// patch guilds render function
			Patches.guilds = BdApi.monkeyPatch(Component.Guilds.prototype, "render", {silent: true, after: (d) => {
				
				// get return value
				const r = d.returnValue;
				
				// find scroller
				const c = r.props.children.find((e) => e.type && e.type.displayName === "VerticalScroller").props.children;
				
				// check if online friends count is not inserted yet
				if (!c.find((e) => e.props && e.props.children && e.props.children.props && e.props.children.props.className === Selector.guilds.friendsOnline)) {

					// insert online friends count before dms
					c.splice(c.indexOf(c.find((e) => e.type && e.type.displayName === "FluxContainer(UnreadDMs)")), 0, React.createElement(OnlineCountContainer));
				}
				
				// return modified return value
				return r;
			}});
			this.log("Patched render of Guilds component");
			
			// force update
			this.forceUpdateAll().then(() => this.log("Enabled"));
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
			this.forceUpdateAll().then(() => this.log("Disabled"));
		}

		/**
		 * Force update the "Guilds" component state nodes
		 */
		async forceUpdateAll() {

			// catch errors
			try {

				// force update guilds wrapper
				for (const e of document.getElementsByClassName(Selector.guildsWrapper.wrapper)) {
					const i = BdApi.getInternalInstance(e);
					i && i.return.stateNode.forceUpdate();
				}
			}
			catch(e) {

				// log error
				this.log("Failed to force update Guilds nodes", console.warn);
				console.error(e);
			}
		}

	};
})();