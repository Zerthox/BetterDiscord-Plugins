/**
 * Emulator plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
	Platform: BdApi.findModuleByProps("getPlatform", "isWindows", "isOSX", "isLinux", "isWeb", "PlatformTypes"),
	Overlay: BdApi.findModuleByProps("initialize", "isSupported", "getFocusedPID")
};

/** Component storage */
const Component = {
	RadioGroup: BdApi.findModuleByDisplayName("RadioGroup")
};

/** Plugin class */
class Plugin {

	constructor() {
		this.defaults = {
			platform: /^win/.test(Module.Platform.platform) ? Module.Platform.PlatformTypes.WINDOWS
			: Module.Platform.platform === "darwin" ? Module.Platform.PlatformTypes.OSX
			: Module.Platform.platform === "linux" ? Module.Platform.PlatformTypes.LINUX
			: Module.Platform.PlatformTypes.WEB
		};
	}

	getSettings()  {
		return (props) => {
			return (
				<Component.RadioGroup
					value={props.platform}
					onChange={(e) => props.update({platform: e.value})}
					options={[
						{
							value: Module.Platform.PlatformTypes.WINDOWS,
							name: "Windows"
						},
						{
							value: Module.Platform.PlatformTypes.OSX,
							name: "MacOS"
						},
						{
							value: Module.Platform.PlatformTypes.LINUX,
							name: "Linux"
						},
						{
							value: Module.Platform.PlatformTypes.WEB,
							name: "Browser"
						}
					]}
				/>
			);
		};
	}

	async update() {
		await this.forceUpdateRoot();
		this.toast(`Emulating ${Module.Platform.isWindows() ? "Windows" : Module.Platform.isOSX() ? "MacOS" : Module.Platform.isLinux() ? "Linux" : "Browser"}`, {type: "info", timeout: 5000});
	}

	toast(msg, opt) {
		this.log(msg);
		BdApi.showToast(msg, opt);
	}

	start() {

		// patch platform specific functions
		for (const platform of ["Windows", "OSX", "Linux", "Web"]) {
			this.createPatch(Module.Platform, `is${platform}`, {name: "Platform", instead: () => this.settings.platform === Module.Platform.PlatformTypes[platform.toUpperCase()]});
		}
		
		// patch settings render function
		this.createPatch(Module.Overlay, "isSupported", {name: "Overlay", instead: () => Module.Platform.isWindows()});
		
		// force update
		this.update();
	}
	
	stop() {

		// force update root
		this.forceUpdateRoot();

		// show toast
		this.toast(`Stopped Emulating`, {type: "info", timeout: 5000});
	}

	async forceUpdateRoot() {

		// catch errors
		try {

			// start at react root
			let fiber = document.querySelector("#app-mount")._reactRootContainer._internalRoot.current;

			// walk down until app component found
			while (!(fiber.type && fiber.type.displayName === "FluxContainer(App)")) {
				fiber = fiber.child;
			}

			// force update app
			fiber.stateNode.forceUpdate();

			// pop settings layer
			if (BdApi.findModuleByProps("getLayers").getLayers().indexOf("USER_SETTINGS") > -1) {
				BdApi.findModuleByProps("pushLayer", "popLayer").popLayer();
			}
		}
		catch(e) {

			// log error
			this.log("Failed to force update", console.warn);
			console.error(e);
		}
	}

}