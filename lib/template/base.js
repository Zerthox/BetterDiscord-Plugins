/**
 * Base Plugin template for BandagedBD
 * @author Zerthox
 * @version 1.0.0
 */

// Api constants
const {React, ReactDOM} = BdApi,
	Flux = BdApi.findModuleByProps("connectStores");

/** Storage for Patches */
const Patches = [];

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
	 * Print a message in Console.
	 * @param {string} msg message
	 * @param {function} [log=console.log] log function to call
	 */
	log(msg, log = console.log) {
		log(`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`, "color: #3a71c1; font-weight: 700;", "color: #666; font-size: .8em;", "");
	}

	/**
	 * Plugin start function
	 */
	start() {

		// call plugin start
		super.start();

		// console output
		this.log("Enabled");
	}

	/**
	 * Plugin stop function
	 */
	stop() {

		// revert all patches
		while (Patches.length > 0) {
			Patches.pop()();
		}
		this.log("Unpatched all");

		// clear css
		if (document.getElementById(this.getName())) {
			BdApi.clearCSS(this.getName(), css);
		}

		// call plugin stop
		super.stop();

		// unmount settings
		if (this.settingsRoot) {
			ReactDOM.unmountComponentAtNode(this.settingsRoot);
			delete this.settingsRoot;
		}

		// console output
		this.log("Disabled");
	}

	/**
	 * Save data via the BetterDiscord Api
	 * @param {string} id identifier for the data to load
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
		Patches.push(BdApi.monkeyPatch(target, method, options));

		// console output
		this.log(`Patched ${method} of ${target.displayName || target.name || target.constructor.displayName || target.constructor.name || "Unknown"} ${target instanceof React.Component ? "component" : "module"}`);
	}

	/**
	 * Force update the closest parent state node of multiple selectors.
	 * @param  {...string} selectors selectors to force update
	 */
	async forceUpdate(...selectors) {

		// iterate over passed selectors
		for (const sel of selectors) {
	
			// catch errors
			try {

				// iterate over elements
				for (const el of document.querySelectorAll(sel)) {

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

			}
			catch (e) {
	
				// log error
				this.log(`Failed to force update "${sel}" nodes`, console.warn);
				console.error(e);
			}
		}
	}

};

// check if plugin has settings
if (Plugin.prototype.getSettings) {

	// define settings panel function
	module.exports.prototype.getSettingsPanel = function() {

		// initialize root if necessary
		if (!this.settingsRoot) {

			// create root element
			this.settingsRoot = document.createElement("div");
			this.settingsRoot.className = `settingsRoot-${this.getName()}`;

			// render settings into root
			ReactDOM.render(this.getSettings(), this.settingsRoot);
		}

		// return root
		return this.settingsRoot;
	};
}