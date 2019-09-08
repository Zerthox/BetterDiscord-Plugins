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
	Guilds: BdApi.findModuleByDisplayName("Guilds"),
	Link: BdApi.findModuleByProps("NavLink").Link
};

/** Selector storage */
const Selector = {
	guildsWrapper: BdApi.findModuleByProps("wrapper", "unreadMentionsBar"),
	guilds: BdApi.findModuleByProps("listItem", "friendsOnline")
};

// OnlineCount component
class OnlineCount extends React.Component {
	render() {
		return (
			<div className={Selector.guilds.listItem}>
				<Component.Link to={{pathname: "/channels/@me"}}>
					<div className={Selector.guilds.friendsOnline} style={{margin: 0, cursor: "pointer"}}>{this.props.online} Online</div>
				</Component.Link>
			</div>
		);
	}
}

// Flux container for OnlineCount component
const OnlineCountContainer = Flux.connectStores([Module.Status], () => ({online: Module.Status.getOnlineFriendCount()}))(OnlineCount);

/** Plugin class */
class Plugin {

	start() {
		
		// patch guilds render function
		this.createPatch(Component.Guilds.prototype, "render", {after: (data) => {
			
			// get return value
			const result = data.returnValue;
			
			// find scroller
			const scroller = qReact(result, (e) => e.type.displayName === "VerticalScroller");
			
			// check if online friends count is not inserted yet
			if (!qReact(scroller, (e) => e.props.className === Selector.guilds.friendsOnline)) {

				// grab scroller children
				const children = scroller.props.children;

				// find index of dms
				const index = children.indexOf(qReact(scroller, (e) => e.type.displayName === "ConnectedUnreadDMs"));

				// insert online friends count before dms
				children.splice(index > - 1 ? index : 1, 0, <OnlineCountContainer/>);
			}
			
			// return modified return value
			return result;
		}});
		
		// force update
		this.forceUpdate(Selector.guildsWrapper.wrapper);
	}
	
	stop() {

		// force update
		this.forceUpdate(Selector.guildsWrapper.wrapper);
	}

}