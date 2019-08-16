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
		this.createPatch(Component.Guilds.prototype, "render", {after: (d) => {
			
			// get return value
			const r = d.returnValue;
			
			// find scroller
			const c = qReact(r, (e) => e.type.displayName === "VerticalScroller").props.children;
			
			// check if online friends count is not inserted yet
			if (!qReact(c, (e) => e.props.children.props.className === Selector.guilds.friendsOnline)) {

				// insert online friends count before dms
				c.splice(c.indexOf(c.find((e) => e.type && e.type.displayName === "FluxContainer(UnreadDMs)")), 0, <OnlineCountContainer/>);
			}
			
			// return modified return value
			return r;
		}});
		
		// force update
		this.forceUpdate(`.${Selector.guildsWrapper.wrapper}`);
	}
	
	stop() {

		// force update
		this.forceUpdate(`.${Selector.guildsWrapper.wrapper}`);
	}

}