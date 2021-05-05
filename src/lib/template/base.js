/**
 * Base Plugin template for BandagedBD
 * @author Zerthox
 */
/* eslint-disable no-unused-vars */

// Api constants
const {React, ReactDOM} = BdApi;
const Flux = BdApi.findModuleByProps("connectStores");

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
    } catch (err) {
        console.debug("Suppressed error in qReact query:\n", err);
    }

    // match node or children
    if (match) {
        return node;
    } else if (node && node.props && node.props.children) {
        // if node has children prop, iterate over child nodes
        for (const child of [node.props.children].flat()) {
            // recur on child node
            const result = qReact(child, query);

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

    constructor(...args) {
        // call plugin constructor
        super(...args);

        // initialize patch storage
        this._Patches = [];

        // load settings if necessary
        if (this.defaults) {
            this.settings = {...this.defaults, ...this.loadData("settings")};
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
        const data = BdApi.loadData(this.getName(), id);
        return data !== undefined && data !== null ? data : fallback;
    }

    /**
     * Inject CSS via the BetterDiscord Api
     * @param {string} css CSS to inject
     */
    injectCSS(css) {
        const el = document.getElementById(this.getName());
        if (!el) {
            BdApi.injectCSS(this.getName(), css);
        } else {
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
            } catch (e) {
                // log error
                this.warn(`Failed to force update "${el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName}" state node`);
                console.error(e);
            }
        }
    }
};

// check if plugin has settings
if (Plugin.prototype.getSettings) {
    const Flex = BdApi.findModuleByDisplayName("Flex");
    const Button = BdApi.findModuleByProps("Link", "Hovers");
    const Form = BdApi.findModuleByProps("FormItem", "FormSection", "FormDivider");
    const Margins = BdApi.findModuleByProps("marginLarge");

    // define settings wrapper
    class Settings extends React.Component {
        constructor(...args) {
            super(...args);
            this.state = this.props.current;
        }

        render() {
            const {name, defaults, children: Child} = this.props;
            return (
                <Form.FormSection>
                    <Child
                        update={(changed) => this.update({...this.state, ...changed})}
                        {...this.state}
                    />
                    <Form.FormDivider className={[Margins.marginTop20, Margins.marginBottom20].join(" ")}/>
                    <Flex justify={Flex.Justify.END}>
                        <Button
                            size={Button.Sizes.SMALL}
                            onClick={() => BdApi.showConfirmationModal(name, "Reset all settings?", {
                                onConfirm: () => this.update(defaults)
                            })}
                        >Reset</Button>
                    </Flex>
                </Form.FormSection>
            );
        }

        update(settings) {
            this.setState(settings);
            this.props.onChange(settings);
        }
    }

    // define settings panel function
    module.exports.prototype.getSettingsPanel = function() {
        return (
            <Settings
                name={this.getName()}
                current={this.settings}
                defaults={this.defaults}
                onChange={(settings) => {
                    this.settings = settings;
                    if (this.update instanceof Function) {
                        this.update();
                    }
                    this.saveData("settings", settings);
                }}
            >{this.getSettings()}</Settings>
        );
    };
}
