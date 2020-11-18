/**
 * BetterFolders plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Dispatcher: BdApi.findModuleByProps("Dispatcher").Dispatcher,
	ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
	FolderStore: BdApi.findModuleByProps("getExpandedFolders")
};

/** Component storage */
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	GuildFolder: BdApi.findModule((m) => m && m.type && m.type.render && m.type.render.toString().includes("defaultFolderName")),
	GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
	Form: BdApi.findModuleByProps("FormSection", "FormText"),
	TextInput: BdApi.findModuleByDisplayName("TextInput"),
	RadioGroup: BdApi.findModuleByDisplayName("RadioGroup"),
	Button: BdApi.findModuleByProps("Link", "Hovers"),
	SwitchItem: BdApi.findModuleByDisplayName("SwitchItem"),
	ImageInput: BdApi.findModuleByDisplayName("ImageInput")
};

/** Selector storage */
const Selector = {
	flex: BdApi.findModuleByProps("flex"),
	modal: BdApi.findModuleByProps("permissionsTitle"),
	button: BdApi.findModuleByProps("colorWhite"),
	margins: BdApi.findModuleByProps("marginLarge"),
	folder: BdApi.findModuleByProps("folder", "expandedFolderBackground", "wrapper"),
	guilds: BdApi.findModuleByProps("guilds", "base"),
	tree: BdApi.findModuleByProps("scroller", "tree")
};

/** Plugin styles */
const Styles = $include("./styles.scss");

/** Store for Folders */
const BetterFolderStore = (() => {

	// read folders data
	const Folders = BdApi.loadData("BetterFolders", "folders") || {};

	// create dispatcher
	const FoldersDispatcher = new Module.Dispatcher();

	// create custom store
	class BetterFolderStore extends Flux.Store {
		setFolder(id, data) {
			if (!Folders[id]) {
				Folders[id] = {};
			}
			Object.assign(Folders[id], data);
			FoldersDispatcher.dirtyDispatch({
				type: "update",
				folderId: id,
				data
			});
			BdApi.saveData("BetterFolders", "folders", Folders);
		}
		getFolder(id) {
			return Folders[id];
		}
		deleteFolder(id) {
			delete Folders[id];
			FoldersDispatcher.dirtyDispatch({
				type: "delete",
				folderId: id
			});
			BdApi.saveData("BetterFolders", "folders", Folders);
		}
	}

	// return new custom store instance
	return new BetterFolderStore(FoldersDispatcher, {
		update() {},
		delete() {}
	});
})();

/** BetterFolderIcon component */
function BetterFolderIcon({icon, always, childProps}) {
	const result = Component.FolderIcon.call(this, childProps);
	if (icon) {
		if (childProps.expanded) {
			result.props.children[0] = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon}`}}/>;
		}
		else if (always) {
			result.props.children[1] = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon}`}}/>;
		}
	}
	return result;
}

const BetterFolderIconContainer = Flux.connectStores(
	[BetterFolderStore],
	({folderId}) => ({...BetterFolderStore.getFolder(folderId)})
)(BetterFolderIcon);

/** BetterFolderUploader component */
class BetterFolderUploader extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			icon: props.icon,
			always: props.always
		};
	}

	setState(state) {
		super.setState(state, () => this.props.onChange && this.props.onChange(this.state));
	}

	render() {
		const {Flex, Button, ImageInput, SwitchItem, Form: {FormText}} = Component;
		return (
			<>
				<Flex align={Selector.flex.alignCenter}>
					<Button color={Selector.button.colorWhite} look={Selector.button.lookOutlined}>
						Upload Image
						<ImageInput onChange={(e) => this.setState({icon: e})}/>
					</Button>
					<FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</FormText>
					<BetterFolderIcon
						childProps={{
							color: this.props.color,
							guildIds: []
						}}
						icon={this.state.icon}
						always
					/>
				</Flex>
				<SwitchItem
					hideBorder
					className={Selector.margins.marginTop8}
					value={this.state.always}
					onChange={(checked) => this.setState({always: checked})}
				>Always display icon</SwitchItem>
			</>
		);
	}

}

/** Plugin class */
class Plugin {

	constructor() {
		this.defaults = {
			closeOnOpen: false
		};
	}

	getSettings() {
		return (props) => (
			<Component.SwitchItem
				note="Close other folders when opening a new folder"
				hideBorder
				value={props.closeOnOpen}
				onChange={(checked) => {
					if (checked) {
						for (const id of Array.from(Module.FolderStore.getExpandedFolders()).slice(1)) {
							Module.ClientActions.toggleGuildFolderExpand(id);
						}
					}
					props.update({closeOnOpen: checked});
				}}
			>Close On Open</Component.SwitchItem>
		);
	}

	start() {

		// inject styles
		this.injectCSS(Styles);

		// patch guild folder render function
		this.createPatch(Component.GuildFolder.type, "render", {name: "GuildFolder", type: "component", after: ({methodArguments: [props], returnValue}) => {
			const container = qReact(returnValue, (e) => e.props.children.type.displayName === "FolderIcon");
			if (container) {
				const icon = container.props.children;
				if (!Component.FolderIcon) {
					Component.FolderIcon = icon.type;
				}
				container.props.children = <BetterFolderIconContainer folderId={props.folderId} childProps={icon.props}/>;
			}
		}});

		// patch guild folder settings modal render function
		this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {after: ({thisObject, returnValue}) => {
			const {RadioGroup, Form: {FormItem}} = Component,
				id = thisObject.props.folderId;
			if (!thisObject.state.iconType) {
				const folder = BetterFolderStore.getFolder(id);
				if (folder) {
					Object.assign(thisObject.state, {
						iconType: "custom",
						icon: folder.icon,
						always: folder.always
					});
				}
				else {
					Object.assign(thisObject.state, {
						iconType: "default",
						icon: null,
						always: false
					});
				}
			}
			const children = qReact(returnValue, (e) => e.type === "form").props.children;
			const {className} = children[0].props;
			children.push(
				<FormItem title="Icon" className={className}>
					<RadioGroup value={thisObject.state.iconType}
						options={[
							{
								name: "Default Icon",
								value: "default"
							},
							{
								name: "Custom Icon",
								value: "custom"
							}
						]}
						onChange={({value}) => thisObject.setState({iconType: value})}
					/>
				</FormItem>
			);
			const button = qReact(returnValue, (e) => e.props.type === "submit");
			BdApi.monkeyPatch(button.props, "onClick", {silent: true, after: () => {
				if (thisObject.state.iconType !== "default" && thisObject.state.icon) {
					BetterFolderStore.setFolder(id, {
						icon: thisObject.state.icon,
						always: thisObject.state.always
					});
				}
				else if (thisObject.state.iconType === "default" && BetterFolderStore.getFolder(id)) {
					BetterFolderStore.deleteFolder(id)
				}
			}});
			if (thisObject.state.iconType !== "default") {
				children.push(
					<FormItem title="Custom Icon" className={className}>
						<BetterFolderUploader
							color={thisObject.state.color}
							icon={thisObject.state.icon}
							always={thisObject.state.always}
							onChange={({icon, always}) => thisObject.setState({icon, always})}
						/>
					</FormItem>
				);
			}
		}});

		// patch client actions toggle guild folder expand function
		this.createPatch(Module.ClientActions, "toggleGuildFolderExpand", {name: "ClientActions", after: ({methodArguments: [folderId], originalMethod}) => {
			if (this.settings.closeOnOpen) {
				for (const id of Module.FolderStore.getExpandedFolders()) {
					id !== folderId && originalMethod(id);
				}
			}
		}});

		// force update
		this.triggerRerender();
	}

	stop() {

		// force update
		this.triggerRerender();
	}

	async triggerRerender() {

		// find tree fiber
		let tree = BdApi.getInternalInstance(document.getElementsByClassName(Selector.tree.tree)[0]);
		if (!tree) {
			this.error("Unable to trigger rerender: Cannot find tree element fiber");
			return;
		}

		// trigger folder rerender during next tree render
		BdApi.monkeyPatch(tree.return, "type", {silent: true, once: true, after: ({returnValue}) => {
			const servers = qReact(returnValue, (e) => e.props.children.find((e) => e.props.folderId));
			if (!servers) {
				this.error("Unable to trigger rerender: Cannot find servers list");
				return;
			}
			for (let {props} of servers.props.children) {
				if (props.folderId) {
					props.draggable = !props.draggable;
				}
			}
		}});

		// find guilds fiber
		let guilds = BdApi.getInternalInstance(document.getElementsByClassName(Selector.guilds.guilds)[0]);
		if (!guilds) {
			this.error("Unable to trigger rerender: Cannot find Guilds element fiber");
			return;
		}
		while (!guilds.type || guilds.type.displayName !== "Guilds") {
			if (!guilds.return) {
				this.error("Unable to trigger rerender: Cannot find Guilds Component");
				return;
			}
			guilds = guilds.return;
		}

		function forceUpdate(stateNode) {
			return new Promise((resolve) => stateNode.forceUpdate(() => resolve()));
		}

		// force update
		await forceUpdate(guilds.stateNode);
		await forceUpdate(guilds.stateNode);
		this.log("Successfully triggered rerender");
	}

}