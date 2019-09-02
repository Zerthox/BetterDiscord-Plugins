/**
 * BetterFolders plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	ClientActions: BdApi.findModuleByProps("toggleGuildFolderExpand"),
	FolderStore: BdApi.findModuleByProps("getExpandedFolders")
};

/** Component storage */
const Component = {
	Flex: BdApi.findModuleByDisplayName("Flex"),
	GuildFolder: BdApi.findModuleByDisplayName("GuildFolder"),
	GuildFolderSettingsModal: BdApi.findModuleByDisplayName("GuildFolderSettingsModal"),
	Icon: BdApi.findModuleByDisplayName("Icon"),
	FormSection: BdApi.findModuleByDisplayName("FormSection"),
	FormTitle: BdApi.findModuleByDisplayName("FormTitle"),
	FormItem: BdApi.findModuleByDisplayName("FormItem"),
	FormText: BdApi.findModuleByDisplayName("FormText"),
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
	button: BdApi.findModuleByProps("colorWhite")
};

/** Storage for folder icons */
const Folders = BdApi.loadData("BetterFolders", "folders") ? BdApi.loadData("BetterFolders", "folders") : {};

/** Plugin styles */
const Styles = _require("./styles.scss");

/** BetterFolderIcon component */
function BetterFolderIcon(props) {
	const result = Component.FolderIcon.apply(this, arguments);
	if (props.expanded) {
		const icon = qReact(result, (e) => e.props.children.type.displayName === "Icon");
		if (icon) {
			icon.props.children = <div className="betterFolders-customIcon" style={{"background-image": `url(${Folders[props.folderId]}`}}/>;
		}
	}
	return result;
}

/** BetterFolderUploader component */
class BetterFolderUploader extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			icon: props.icon
		};
	}

	render() {
		return (
			<Component.Flex align={Selector.flex.alignCenter}>
				<Component.Button color={Selector.button.colorWhite} look={Selector.button.lookOutlined}>
					Upload Image
					<Component.ImageInput
						onChange={(e) => {
							this.setState({icon: e}, () => {
								this.props.onChange && this.props.onChange(this.state);
							});
						}}
					/>
				</Component.Button>
				<Component.FormText type="description" style={{margin: "0 10px 0 40px"}}>Preview:</Component.FormText>
				<div className={[Selector.folder.folder, "betterFolders-preview"].join(" ")} style={{"background-image": this.state.icon ? `url(${this.state.icon})` : null}}/>
			</Component.Flex>
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
				onChange={(event) => {
					const enabled = event.currentTarget.checked;
					if (enabled) {
						for (const id of Array.from(Module.FolderStore.getExpandedFolders()).slice(1)) {
							Module.ClientActions.toggleGuildFolderExpand(id);
						}
					}
					props.update({closeOnOpen: enabled});
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
			if (Folders[id]) {
				const icon = qReact(d.returnValue, (e) => e.props.children.type.displayName === "FolderIcon");
				if (icon) {
					if (!Component.FolderIcon) {
						Component.FolderIcon = icon.props.children.type;
					}
					const iconProps = icon.props.children.props;
					iconProps.folderId = id;
					icon.props.children = <BetterFolderIcon {...iconProps}/>;
				}
			}
		}});

		// patch guild folder settings modal render function
		this.createPatch(Component.GuildFolderSettingsModal.prototype, "render", {after: (data) => {
			const context = data.thisObject;
			const id = context.props.folderId;
			if (!context.state.iconType) {
				context.state.iconType = Folders[id] ? "custom" : "default";
			}
			if (!context.state.icon) {
				context.state.icon = Folders[id]
			}
			const children = qReact(data.returnValue, (e) => e.type === "form").props.children;
			children.push(
				<Component.FormItem title="Icon" className={children[0].props.className}>
					<Component.RadioGroup value={context.state.iconType}
						options={[
							{
								name: (
									<Component.Flex align={Selector.flex.alignCenter}>
										<Component.Icon className={Selector.modal.icon} name="Folder"/>
										Default Icon
									</Component.Flex>
								),
								value: "default"
							},
							{
								name: (
									<Component.Flex align={Selector.flex.alignCenter}>
										<Component.Icon className={Selector.modal.icon} name="Nova_Help"/>
										Custom Icon
									</Component.Flex>
								),
								value: "custom"
							}
						]}
						onChange={(e) => {
							context.setState({iconType: e.value});
						}}
					/>
				</Component.FormItem>
			);
			const button = qReact(data.returnValue, (e) => e.props.type === "submit");
			BdApi.monkeyPatch(button.props, "onClick", {silent: true, after: (d) => {
				if (context.state.iconType !== "default" && context.state.icon) {
					Folders[id] = context.state.icon;
				}
				else if (Object.keys(Folders).indexOf(id.toString()) > -1) {
					delete Folders[id];
				}
				BdApi.saveData("BetterFolders", "folders", Folders);
				this.forceUpdate(`.${Selector.folder.wrapper}`);
			}});
			if (context.state.iconType !== "default") {
				children.push(
					<Component.FormItem title="Custom Icon" className={children[0].props.className}>
						<BetterFolderUploader icon={context.state.icon} onChange={(e) => context.setState({icon: e.icon})}/>
					</Component.FormItem>
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