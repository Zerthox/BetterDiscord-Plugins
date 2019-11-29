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
	GuildFolder: BdApi.findModuleByDisplayName("GuildFolder"),
	GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
	Icon: BdApi.findModuleByDisplayName("Icon"),
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
	folder: BdApi.findModuleByProps("folder", "expandedGuilds", "wrapper"),
	modal: BdApi.findModuleByProps("permissionsTitle"),
	button: BdApi.findModuleByProps("colorWhite"),
	margins: BdApi.findModuleByProps("marginLarge")
};

/** Plugin styles */
const Styles = _require("./styles.scss");

/** Store for Folders */
const BetterFolderStore = (() => {

	// read folders data
	const Folders = BdApi.loadData("BetterFolders", "folders") || {};

	// backwards compatibility - TODO: remove in a future version
	let changed = false;
	for (const [id, value] of Object.entries(Folders)) {
		if (typeof value === "string") {
			Folders[id] = {
				icon: value,
				always: false
			};
			changed = true;
		}
	}
	if (changed) {
		BdApi.saveData("BetterFolders", "folders", Folders);
	}

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
		update: () => {},
		delete: () => {}
	});
})();

/** BetterFolderIcon component */
function BetterFolderIcon({expanded, icon, always, childProps}) {
	const result = Component.FolderIcon.call(this, childProps);
	if (icon) {
		if (expanded) {
			const Icon = qReact(result, (e) => e.props.children.type.displayName === "Icon");
			if (Icon) {
				Icon.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon}`}}/>;
			}
		}
		else if (always) {
			result.props.children = <div className="betterFolders-customIcon" style={{backgroundImage: `url(${icon}`}}/>;
		}
	}
	return result;
}

const BetterFolderIconContainer = Flux.connectStores(
	[BetterFolderStore],
	({childProps: {expanded, folderId}}) => Object.assign({expanded}, BetterFolderStore.getFolder(folderId))
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
		super.setState(state, () => {
			this.props.onChange && this.props.onChange(this.state);
		});
	}

	render() {
		const {Flex, Button, ImageInput, SwitchItem, Form: {FormText}} = Component;
		return (
			<>
				<Flex align={Selector.flex.alignCenter}>
					<Button color={Selector.button.colorWhite} look={Selector.button.lookOutlined}>
						Upload Image
						<ImageInput
							onChange={(e) => {
								this.setState({icon: e});
							}}
						/>
					</Button>
					<FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</FormText>
					<div className={[Selector.folder.folder, "betterFolders-preview"].join(" ")} style={{"background-image": this.state.icon ? `url(${this.state.icon})` : null}}/>
				</Flex>
				<Flex>
					<SwitchItem
						hideBorder
						className={Selector.margins.marginTop8}
						value={this.state.always}
						onChange={({currentTarget: {checked}}) => this.setState({always: checked})}
					>Always display icon</SwitchItem>
				</Flex>
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
				onChange={({currentTarget: {checked}}) => {
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
		this.createPatch(Component.GuildFolder.prototype, "render", {after: (d) => {
			const id = d.thisObject.props.folderId;
			const icon = qReact(d.returnValue, (e) => e.props.children.type.displayName === "FolderIcon");
			if (icon) {
				if (!Component.FolderIcon) {
					Component.FolderIcon = icon.props.children.type;
				}
				const iconProps = icon.props.children.props;
				iconProps.folderId = id;
				icon.props.children = <BetterFolderIconContainer childProps={iconProps}/>;
			}
		}});
		this.forceUpdate(`.${Selector.folder.wrapper}`);

		// patch guild folder settings modal render function
		this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {after: ({thisObject: context, returnValue}) => {
			const {Flex, Icon, RadioGroup, Form: {FormItem}} = Component,
				id = context.props.folderId;

			if (!context.state.iconType) {
				const folder = BetterFolderStore.getFolder(id);
				if (folder) {
					Object.assign(context.state, {
						iconType: "custom",
						icon: folder.icon,
						always: folder.always
					});
				}
				else {
					Object.assign(context.state, {
						iconType: "default",
						icon: null,
						always: false
					});
				}
			}
			const children = qReact(returnValue, (e) => e.type === "form").props.children;
			children.push(
				<FormItem title="Icon" className={children[0].props.className}>
					<RadioGroup value={context.state.iconType}
						options={[
							{
								name: (
									<Flex align={Selector.flex.alignCenter}>
										<Icon className={Selector.modal.icon} name="Folder"/>
										Default Icon
									</Flex>
								),
								value: "default"
							},
							{
								name: (
									<Flex align={Selector.flex.alignCenter}>
										<Icon className={Selector.modal.icon} name="Nova_Help"/>
										Custom Icon
									</Flex>
								),
								value: "custom"
							}
						]}
						onChange={({value}) => context.setState({iconType: value})}
					/>
				</FormItem>
			);
			const button = qReact(returnValue, (e) => e.props.type === "submit");
			BdApi.monkeyPatch(button.props, "onClick", {silent: true, after: (data) => {
				if (context.state.iconType !== "default" && context.state.icon) {
					BetterFolderStore.setFolder(id, {
						icon: context.state.icon,
						always: context.state.always
					});
				}
				else if (Object.keys(Folders).indexOf(id.toString()) > -1) {
					BetterFolderStore.deleteFolder(id)
				}
			}});
			if (context.state.iconType !== "default") {
				children.push(
					<FormItem title="Custom Icon" className={children[0].props.className}>
						<BetterFolderUploader icon={context.state.icon} always={context.state.always} onChange={(data) => context.setState({icon: data.icon, always: data.always})}/>
					</FormItem>
				);
			}
		}});

		// patch client actions toggle guild folder expand function
		this.createPatch(Module.ClientActions, "toggleGuildFolderExpand", {name: "ClientActions", after: (data) => {
			if (this.settings.closeOnOpen) {
				const target = data.methodArguments[0];
				for (const id of Module.FolderStore.getExpandedFolders()) {
					id !== target && data.originalMethod(id);
				}
			}
		}});
		
		// force update
		this.forceUpdate(Selector.folder.wrapper);
	}
	
	stop() {

		// force update
		this.forceUpdate(Selector.folder.wrapper);
	}

}