/**
 * BetterVolume plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	SettingsStore: BdApi.findModuleByProps("getLocalVolume"),
	Audio: BdApi.findModuleByProps("setLocalVolume")
};

/** Component storage */
const Component = {
	ControlItem: BdApi.findModule((m) => m && m.default instanceof Function && m.default.displayName === "MenuControlItem")
};

const Styles = $include("./styles.scss");

function VolumeInput({value, onChange}) {
	return (
		<div className="container-BetterVolume">
			<input
				type="number"
				min="0"
				max="999999"
				value={Math.round((value + Number.EPSILON) * 100) / 100}
				onChange={({target}) => onChange(Math.min(Math.max(target.value, target.min), target.max))}
				className="input-BetterVolume"
			/>
			<span>%</span>
		</div>
	);
}

const ConnectedVolumeInput = Flux.connectStores(
	[Module.SettingsStore],
	({control: {props: {value, onChange}}}) => ({value, onChange})
)(VolumeInput);

/** Plugin class */
class Plugin {

	start() {

		// inject styles
		this.injectCSS(Styles);

		// patch menu control item
		this.createPatch(Component.ControlItem, "default", {name: "MenuControlItem", after: ({methodArguments: [props], returnValue}) => {

			// check for user volume id
			if (props.id === "user-volume") {

				// find slider
				const slider = qReact(returnValue, (e) => e.props.maxValue === 200);
				if (!slider) {
					this.error("Unable to find slider");
					return returnValue;
				}

				// append volume input
				returnValue.props.children = [
					returnValue.props.children,
					<ConnectedVolumeInput
						control={slider}
					/>
				].flat();
			}
			return returnValue;
		}});

	}

	stop() {}

}