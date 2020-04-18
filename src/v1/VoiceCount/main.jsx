/**
 * VoiceCount plugin
 * @author Zerthox
 */

/** Component storage */
const Component = {
	ChannelItem: BdApi.findModuleByDisplayName("ChannelItem")
};

/** Selector storage */
const Selector = {
	UserLimit: BdApi.findModuleByProps("userLimit", "iconVisibility")
};

const Styles = $include("./styles.scss") + `
.${Selector.UserLimit.iconVisibility.replace(/\s/g, ".")}:focus .userCount,
.${Selector.UserLimit.iconVisibility.replace(/\s/g, ".")}:focus-within .userCount,
.${Selector.UserLimit.iconVisibility.replace(/\s/g, ".")}:hover .userCount {
	background: var(--background-tertiary);
}`;

/** Plugin class */
class Plugin {

	start() {
		this.injectCSS(Styles);

		this.createPatch(Component.ChannelItem.prototype, "render", {before: ({thisObject: {props}}) => {
			const {channel} = props;
			if (channel.type === 2) {
				const {userCount} = props.children.find((e) => e && "userCount" in e.props).props;
				props.children = [(
					<div className="userCount">{userCount}</div>
				), props.children].flat();
			}
		}});
	}

	stop() {}

}