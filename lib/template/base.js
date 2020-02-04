/**
 * Base Plugin template for BandagedBD
 * @author Zerthox
 * @version 1.2.0
 */

// Api constants
const {React, ReactDOM} = BdApi,
	Flux = BdApi.findModuleByProps("connectStores");

/**
 * Find a child element matching a query in a ReactElement tree.
 * @param {ReactElement} node root node of the tree to search
 * @param {function} query search predicate
 * @return {?ReactElement} element matching the query or null
 */
function qReact(node, query) {

	// determine if node matches the query
	let match = false;
	try {
		match = query(node);
	}
	catch (err) {
		console.debug("Suppressed error in qReact query:\n", err);
	}
	if (match) {

		// if match, return node
		return node;
	}
	else if (node && node.props && node.props.children) {

		// if node has children prop, iterate over child nodes
		for (const child of [node.props.children].flat()) {

			// recur on child node
			const result = arguments.callee(child, query);

			// if result in subtree, return result
			if (result) {
				return result;
			}
		}
	}

	// if no result, return null
	return null;
}

"contents";

module.exports = class Wrapper extends Plugin {

	/**
	 * @return {string} Plugin name
	 */
	getName() {
		return "@meta{name}";
	}

	/**
	 * @return {string} Plugin version
	 */
	getVersion() {
		return "@meta{version}";
	}

	/**
	 * @return {string} Plugin author
	 */
	getAuthor() {
		return "@meta{author}";
	}

	/**
	 * @return {string} Plugin description
	 */
	getDescription() {
		return "@meta{description}";
	}

	/**
	 * Print messages to the console
	 * @param {...string} msg messages
	 */
	log(...msgs) {
		console.log(`%c[${this.getName()}] %c(v${this.getVersion()})`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", ...msgs);
	}

	/**
	 * Print warnings to the console
	 * @param {...string} msgs messages
	 */
	warn(...msgs) {
		console.warn(`%c[${this.getName()}] %c(v${this.getVersion()})`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", ...msgs);
	}

	/**
	 * Print warnings to the console
	 * @param {...string} msgs messages
	 */
	error(...msgs) {
		console.error(`%c[${this.getName()}] %c(v${this.getVersion()})`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", ...msgs);
	}

	/**
	 *
	 */
	constructor() {

		// call plugin constructor
		super(...arguments);

		// initialize patch storage
		this._Patches = [];

		// load settings if necessary
		if (this.defaults) {
			this.settings = Object.assign({}, this.defaults, this.loadData("settings"));
		}
	}

	/**
	 * Plugin start function
	 */
	start() {

		// console output
		this.log("Enabled");

		// call plugin start
		super.start();
	}

	/**
	 * Plugin stop function
	 */
	stop() {

		// revert all patches
		while (this._Patches.length > 0) {
			this._Patches.pop()();
		}
		this.log("Unpatched all");

		// clear css
		if (document.getElementById(this.getName())) {
			BdApi.clearCSS(this.getName());
		}

		// call plugin stop
		super.stop();

		// unmount settings
		if (this._settingsRoot) {
			ReactDOM.unmountComponentAtNode(this._settingsRoot);
			delete this._settingsRoot;
		}

		// console output
		this.log("Disabled");
	}

	/**
	 * Save data via the BetterDiscord Api
	 * @param {string} id identifier for the data to save
	 * @param {*} value value to save
	 */
	saveData(id, value) {
		return BdApi.saveData(this.getName(), id, value);
	}

	/**
	 * Load data via the BetterDiscord Api
	 * @param {string} id identifier for the data to load
	 * @param {?*} fallback fallback value
	 */
	loadData(id, fallback = null) {
		const l = BdApi.loadData(this.getName(), id);
		return l ? l : fallback;
	}

	/**
	 * Inject CSS via the BetterDiscord Api
	 * @param {string} css CSS to inject
	 */
	injectCSS(css) {
		const el = document.getElementById(this.getName());
		if (!el) {
			BdApi.injectCSS(this.getName(), css);
		}
		else {
			el.innerHTML += "\n\n/* --- */\n\n" + css;
		}
	}

	/**
	 * Create a monkey patch via the BetterDiscord Api
	 * @param {*} target target object to patch
	 * @param {string} method target method to patch
	 * @param {*} options patch options
	 */
	createPatch(target, method, options) {

		// set silent to true
		options.silent = true;

		// create patch
		this._Patches.push(BdApi.monkeyPatch(target, method, options));

		// determine target name
		const name = options.name || target.displayName || target.name || target.constructor.displayName || target.constructor.name || "Unknown";

		// console output
		this.log(`Patched ${method} of ${name} ${options.type === "component" || target instanceof React.Component ? "component" : "module"}`);
	}

	/**
	 * Force update the closest parent state node of multiple elements identified by their class name.
	 * @param  {...string} classes classes to force update
	 */
	async forceUpdate(...classes) {
		this.forceUpdateElements(...classes.map((e) => Array.from(document.getElementsByClassName(e))).flat());
	}

	/**
	 * Force update the closest parent state node of multiple elements.
	 * @param  {...HTMLElement} elements elements to force update
	 */
	async forceUpdateElements(...elements) {

		// iterate over elements
		for (const el of elements) {

			// catch errors
			try {

				// grab react fiber
				let fiber = BdApi.getInternalInstance(el);

				// check if fiber found
				if (fiber) {

					// walk up until state node found
					while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
						fiber = fiber.return;
					}

					// force update the state node
					fiber.stateNode.forceUpdate();
				}
			}
			catch (e) {

				// log error
				this.warn(`Failed to force update "${el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName}" state node`);
				console.error(e);
			}
		}
	}

};

// check if plugin has settings
if (Plugin.prototype.getSettings) {

	// define settings panel function
	module.exports.prototype.getSettingsPanel = function() {

		const Flex = BdApi.findModuleByDisplayName("Flex"),
			Button = BdApi.findModuleByProps("Link", "Hovers"),
			Form = BdApi.findModuleByProps("FormItem", "FormSection", "FormDivider"),
			Margins = BdApi.findModuleByProps("marginLarge");

		const SettingsPanel = Object.assign(this.getSettings(), {displayName: "SettingsPanel"});

		const self = this;

		class Settings extends React.Component {

			constructor(props) {
				super(props);
				this.state = this.props.settings;
			}

			render() {
				const props = Object.assign({update: (e) => this.setState(e, () => this.props.update(this.state))}, this.state);
				return (
					<Form.FormSection>
						<Form.FormTitle tag="h2">{this.props.name} Settings</Form.FormTitle>
						<SettingsPanel {...props}/>
						<Form.FormDivider className={[Margins.marginTop20, Margins.marginBottom20].join(" ")}/>
						<Flex justify={Flex.Justify.END}>
							<Button size={Button.Sizes.SMALL} onClick={() => {
								BdApi.showConfirmationModal(this.props.name, "Reset all settings?", {
									onConfirm: () => {
										this.props.reset();
										this.setState(self.settings);
									}
								});
							}}>Reset</Button>
						</Flex>
					</Form.FormSection>
				);
			}

		}

		Settings.displayName = this.getName() + "Settings";

		// initialize root if necessary
		if (!this._settingsRoot) {

			// create root element
			this._settingsRoot = document.createElement("div");
			this._settingsRoot.className = `settingsRoot-${this.getName()}`;

			// render settings into root
			ReactDOM.render(
				<Settings
					name={this.getName()}
					settings={this.settings}
					update={(state) => {
						this.saveData("settings", Object.assign(this.settings, state));
						this.update && this.update();
					}}
					reset={() => {
						this.saveData("settings", Object.assign(this.settings, this.defaults));
						this.update && this.update();
					}}
				/>,
				this._settingsRoot
			);
		}

		// return root
		return this._settingsRoot;
	};
}