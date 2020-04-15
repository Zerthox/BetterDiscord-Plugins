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

		// TODO: add to template?
		// grab guilds fiber
		let fiber = BdApi.getInternalInstance(document.getElementsByClassName(Selector.guilds.guilds)[0]);
		if (!fiber) {
			this.error("Error patching Guilds: Cannot find Guilds element fiber");
			return;
		}
		while (!fiber.type || fiber.type.displayName !== "Guilds") {
			if (!fiber.return) {
				this.error("Error patching Guilds: Cannot find Guilds Component");
				return;
			}
			fiber = fiber.return;
		}

		// patch guilds render function
		this.createPatch(fiber.type.prototype, "render", {after: ({returnValue}) => {

			// find scroller
			const scroller = qReact(returnValue, (e) => e.type.displayName === "VerticalScroller");
			if (!scroller) {
				this.error("Error during render: Cannot find VerticalScroller Component");
				return;
			}

			// check if online friends count is not inserted yet
			if (!qReact(scroller, (e) => e.props.className === Selector.friendsOnline)) {

				// grab scroller children
				const {children} = scroller.props;

				// find index of dms
				const index = children.indexOf(qReact(scroller, (e) => e.type.displayName === "ConnectedUnreadDMs"));

				// insert online friends count before dms
				children.splice(index > - 1 ? index : 1, 0, <OnlineCountContainer/>);
			}
		}});

		// force update
		fiber.stateNode.forceUpdate();
	}

	stop() {

		// force update
		this.forceUpdate(Selector.guilds.guilds);
	}

}