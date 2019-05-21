//META {"name": "Emulator", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/Emulator.plugin.js"} *//

/**
 * @author Zerthox
 * @version 0.4.2
 * @return {class} Emulator plugin class
 */
const Emulator = (() => {

	// Api constants
	const {React, ReactDOM} = BdApi;

	/** Settings storage */
	const Settings = {};

	/** Module storage */
	const Module = {
		Native: BdApi.findModuleByProps("getPlatform", "isWindows", "isOSX", "isLinux", "isWeb", "PlatformTypes"),
		Overlay: BdApi.findModuleByProps("initialize", "isSupported", "getFocusedPID")
	};

	// get original platform
	const platform = /^win/.test(Module.Native.platform) ? Module.Native.PlatformTypes.WINDOWS : Module.Native.platform === "darwin" ? Module.Native.PlatformTypes.OSX : Module.Native.platform === "linux" ? Module.Native.PlatformTypes.LINUX : Module.Native.PlatformTypes.WEB;

	/** Storage for Patches */
	const Patches = {};

	// return plugin class
	return class Emulator {

		/**
		 * @return {string} Plugin name
		 */
		getName() {
			return "Emulator";
		}

		/**
		 * @return {string} Plugin version
		 */
		getVersion() {
			return "0.4.2";
		}

		/**
		 * @return {string} Plugin author
		 */
		getAuthor() {
			return "Zerthox";
		}
		
		/**
		 * @return {string} Plugin description
		 */
		getDescription() {
			return "Emulate Windows, MacOS, Linux or Browser on any platform.\nWARNING: Emulating a different platform may cause unwanted side effects. Use at own risk.";
		}

		/**
		 * Log a message in Console
		 * @param {string} msg message
		 */
		log(msg) {
			console.log(`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", "");
		}
		
		/**
		 * Show a toast and log a message in console
		 * @param {string} msg message
		 * @param {object} opt options
		 * @param {string} opt.type toast type
		 * @param {number} opt.timeout toast duration
		 * @param {boolean} opt.icon enable/disable toast icon
		 */
		toast(msg, opt) {
			this.log(msg);
			BdApi.showToast(msg, opt);
		}
		
		/**
		 * @return {HTMLElement} Plugin settings panel
		 */
		getSettingsPanel() {
			const self = this;

			// create root element
			const root = document.createElement("div");
			root.className = `root-${this.getName()}`;

			// queue react render
			setTimeout(() => {

				/**
				 * Emulator settings component
				 */
				class settingsEmulator extends React.Component {

					/**
					 * Constructor
					 */
					constructor(props) {

						// call parent constructor
						super(props);

						// set initial state
						this.state = {
							selected: Settings.platform
						};
					}

					/**
					 * Render settings panel component
					 */
					render() {
						return React.createElement("div", {className: `container-${self.getName()}`, style: {padding: "5px 10px"}},
							React.createElement("h3", {className: `header-${self.getName()}`, style: {margin: "3px 5px", fontSize: "20px", fontWeight: 700}}, "Emulated Platform:"),
							this.renderItems([
								{
									value: Module.Native.PlatformTypes.WINDOWS,
									name: "Windows"
								},
								{
									value: Module.Native.PlatformTypes.OSX,
									name: "MacOS"
								},
								{
									value: Module.Native.PlatformTypes.LINUX,
									name: "Linux"
								},
								{
									value: Module.Native.PlatformTypes.WEB,
									name: "Browser"
								}
							])
						);
					}
					
					/**
					 * Render radio buttons
					 * @param {object[]} a object array with names & values
					 */
					renderItems(a) {
						
						// map passed array
						return a.map((c) => {
							
							// return new item for each element
							return React.createElement("div", {className: `item-${self.getName()}`, style: {margin: "3px 5px"}},
								React.createElement("label", {className: `label-${self.getName()}`},
									React.createElement("input", {
										className: `radio-${self.getName()}`,
										type: "radio",
										name: c.name,
										value: c.value,
										checked: c.value === Settings.platform,
										onChange: (e) => this.handleChange(e)
									}),
									c.name
								)
							);
						});
					}

					/**
					 * Radio button change handler
					 * @param {*} e change event
					 */
					handleChange(e) {

						// set platform to target value
						Settings.platform = e.target.value;

						// save platform
						BdApi.saveData(self.getName(), "platform", Settings.platform);

						// force update
						self.forceUpdateAll();

						// unmount settings
						ReactDOM.unmountComponentAtNode(root);

						// show toast
						self.toast(`Emulating ${e.target.name}`, {type: "info", timeout: 5000});
					}
				
				}
					
				// unmount upon close
				const e = document.querySelector(`.settings-open > div[style*="cursor: pointer"]`);
				BdApi.monkeyPatch(e[Object.keys(e).find((e) => /^__reactEventHandlers/.test(e))], "onClick", {once: true, silent: true, before: () => {
					ReactDOM.unmountComponentAtNode(root);
				}});
				
				// render container
				ReactDOM.render(React.createElement(settingsEmulator), root);
			}, 0);
				
			// return root element
			return root;
		}
			
		/**
		 * Plugin class constructor
		 */
		constructor() {
				
			// load settings
			Settings.platform = BdApi.loadData(this.getName(), "platform");
			
			// if no custom platform, default to old platform
			if (!Settings.platform) {
				Settings.platform = platform;
			}
		}
		
		/**
		 * Plugin start function
		 */
		start() {
			
			// patch platform specific functions
			for (const e of ["Windows", "OSX", "Linux", "Web"]) {
				Patches[`is${e}`] = BdApi.monkeyPatch(Module.Native, `is${e}`, {silent: true, instead: () => Settings.platform === Module.Native.PlatformTypes[e.toUpperCase()]});
				this.log(`Patched is${e} of Native module`);
			}
			
			// patch settings render function
			Patches.overlay = BdApi.monkeyPatch(Module.Overlay, "isSupported", {silent: true, instead: () => Module.Native.isWindows()});
			this.log("Patched isSupported of Overlay module");
			
			// force update
			this.forceUpdateAll();

			// show toast
			this.toast(`Emulating ${Module.Native.isWindows() ? "Windows" : Module.Native.isOSX() ? "MacOS" : Module.Native.isLinux() ? "Linux" : "Browser"}`, {type: "info", timeout: 5000});
			
			// console output
			this.log("Enabled");
		}
		
		/**
		 * Plugin stop function
		 */
		stop() {

			// revert all patches
			for (const k in Patches) {
				Patches[k]();
				delete Patches[k];
			}
			this.log("Unpatched all");

			// force update
			this.forceUpdateAll();

			// show toast
			this.toast(`Stopped Emulating`, {type: "info", timeout: 5000});

			// console output
			this.log("Disabled");
		}


		/**
		 * Force update app & close settings
		 */
		forceUpdateAll() {

			// force update app
			document.querySelector("#app-mount")._reactRootContainer._internalRoot.current.child.child.child.child.child.stateNode.forceUpdate();

			// pop settings layer
			if (BdApi.findModuleByProps("getLayers").getLayers().indexOf("USER_SETTINGS") > -1) {
				BdApi.findModuleByProps("pushLayer", "popLayer").popLayer();
			}
		}

	}
})();