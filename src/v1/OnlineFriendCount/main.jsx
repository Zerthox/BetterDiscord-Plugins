/**
 * OnlineFriendCount plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Status: BdApi.findModuleByProps("getStatus", "getOnlineFriendCount")
};

/** Component storage */
const Component = {
	Link: BdApi.findModuleByProps("NavLink").Link
};

/** Selector storage */
const Selector = {
	guilds: BdApi.findModuleByProps("guilds", "base"),
	list: BdApi.findModuleByProps("listItem"),
	friendsOnline: "friendsOnline-2JkivW"
};

/** Plugin styles */
const Styles = $include("./styles.scss");

// OnlineCount component
function OnlineCount({online}) {
	return (
		<div className={Selector.list.listItem}>
			<Component.Link to={{pathname: "/channels/@me"}}>
				<div className={Selector.friendsOnline}>{online} Online</div>
			</Component.Link>
		</div>
	);
}

// Flux container for OnlineCount component
const OnlineCountContainer = Flux.connectStores([Module.Status], () => ({online: Module.Status.getOnlineFriendCount()}))(OnlineCount);

/** Plugin class */
class Plugin {

	start() {

		// inject styles
		this.injectCSS(Styles);

		// find guilds fiber
		const guilds = this.findGuilds();

		// helper for finding children function
		const findChildFunc = (el) => {
			while (!(el.props.children instanceof Function)) {
				if (!el.props.children) {
					this.log(`Unable to find children function for "${el.type.toString()}"`);
					return null;
				}
				el = el.props.children;
			}
			return el;
		};

		// chain patch into children
		this.createPatch(guilds.type.prototype, "render", {after: ({returnValue}) => {
			BdApi.monkeyPatch(findChildFunc(returnValue).props, "children", {silent: true, after: ({returnValue}) => {
				BdApi.monkeyPatch(findChildFunc(returnValue).props, "children", {silent: true, after: ({returnValue}) => {

					// find scroller
					const scroller = qReact(returnValue, (e) => e.props.children.find((e) => e.type.displayName === "ConnectedUnreadDMs"));
					if (!scroller) {
						this.error("Error during render: Cannot find guilds scroller Component");
						return;
					}

					// grab scroller children
					const {children} = scroller.props;

					// find index of dms
					const index = children.indexOf(qReact(scroller, (e) => e.type.displayName === "ConnectedUnreadDMs"));

					// insert online friends count before dms
					children.splice(index > -1 ? index : 1, 0, <OnlineCountContainer/>);
				}});
			}});
		}});

		// force update
		guilds.stateNode.forceUpdate();
	}

	stop() {
		this.findGuilds().stateNode.forceUpdate();
	}

	findGuilds() {

		// grab fiber
		let guilds = BdApi.getInternalInstance(document.getElementsByClassName(Selector.guilds.guilds)[0]);
		if (!guilds) {
			this.error("Cannot find Guilds element fiber");
			return;
		}

		// walk until guilds component found
		while (!guilds.type || guilds.type.displayName !== "Guilds") {
			if (!guilds.return) {
				this.error("Cannot find Guilds Component");
				return;
			}
			guilds = guilds.return;
		}
		return guilds;
	}

}