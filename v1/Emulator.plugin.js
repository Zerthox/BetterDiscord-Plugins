//META {"name": "Emulator", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/Emulator.plugin.js"} *//

/**
 * @author Zerthox
 * @version 0.3.0
 * @return {class} Emulator plugin class
 */
const Emulator = (() => {

    // Api constants
    const {React, ReactDOM} = BdApi;

    /**
     * settings
     */
    const Settings = {};

    /**
     * module storage
     */
    const Module = {
        native: BdApi.findModuleByProps("getPlatform", "isWindows", "isOSX", "isLinux", "isWeb", "PlatformTypes"),
        settings: BDV2.WebpackModules.findByDisplayName("SettingsView")
    };

    // get original platform
    const platform = /^win/.test(Module.native.platform) ? Module.native.PlatformTypes.WINDOWS : Module.native.platform === "darwin" ? Module.native.PlatformTypes.OSX : Module.native.platform === "linux" ? Module.native.PlatformTypes.LINUX : Module.native.PlatformTypes.WEB;

    /**
     * storage for patches
     */
    const Patches = {};

    // return plugin class
    return class Emulator {

        /**
         * @return {string} plugin name
         */
        getName() {
            return "Emulator";
        }
        
        /**
         * @return {*} plugin description
         */
        getDescription() {
            return React.createElement("span", {"white-space": "pre-line"},
                "Emulate Windows, MacOS, Linux or Browser on any platform.\n",
                React.createElement("b", {}, "WARNING:"),
                " Emulating a different platform may cause unwanted side effects. Use at own risk."
            );
        }
        
        /**
         * @return {string} plugin version
         */
        getVersion() {
            return "0.3.0";
        }
        
        /**
         * @return {*} plugin author
         */
        getAuthor() {
            return React.createElement("a", {href: "https://github.com/Zerthox", target: "_blank"}, "Zerthox");
        }
        
        /**
         * @return {HTMLElement} plugin settings panel
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
                     * constructor
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
                     * render settings panel component
                     * @override
                     */
                    render() {
                        return React.createElement("div", {className: `container-${self.getName()}`, style: {padding: "5px 10px"}},
                            React.createElement("h3", {className: `header-${self.getName()}`, style: {margin: "3px 5px", fontSize: "20px", fontWeight: 700}}, "Emulated Platform:"),
                            this.renderItems([
                                {
                                    value: Module.native.PlatformTypes.WINDOWS,
                                    name: "Windows"
                                },
                                {
                                    value: Module.native.PlatformTypes.OSX,
                                    name: "MacOS"
                                },
                                {
                                    value: Module.native.PlatformTypes.LINUX,
                                    name: "Linux"
                                },
                                {
                                    value: Module.native.PlatformTypes.WEB,
                                    name: "Browser"
                                }
                            ])
                        );
                    }
                    
                    /**
                     * render radio buttons
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
                     * radio button change handler
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
                        BdApi.showToast(`Emulating ${e.target.name}`, {type: "info", timeout: 5000});
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
                
            // return empty string
            return root;
        }
            
        /**
         * plugin class constructor
         */
        constructor() {
                
            // load settings
            Settings.platform = BdApi.loadData(this.getName(), "platform");
            
            // if no custom platform default to old platform
            if (!Settings.platform) {
                Settings.platform = platform;
            }
        }
        
        /**
         * plugin start function
         */
        start() {
            
            // patch platform specific functions
            for (const e of ["Windows", "OSX", "Linux", "Web"]) {
                Patches[`is${e}`] = BdApi.monkeyPatch(Module.native, `is${e}`, {displayName: "Native Module", instead: () => Settings.platform === Module.native.PlatformTypes[e.toUpperCase()]});
            }
            
            // patch settings render function
            Patches.settings = BdApi.monkeyPatch(Module.settings.prototype, "render", {instead: (d) => {
                
                // get this
                const t = d.thisObject;
                
                // modify overlay section predicate
                t.props.sections.find((e) => e.label === "Overlay").predicate = () => Module.native.isWindows();
                
                // return original method with modified props
                return d.originalMethod.apply(t);
            }});
            
            // force update
            this.forceUpdateAll();

            // show toast
            BdApi.showToast(`Emulating ${Module.native.isWindows() ? "Windows" : Module.native.isOSX() ? "MacOS" : Module.native.isLinux() ? "Linux" : "Browser"}`, {type: "info", timeout: 5000});
            
            // console output
            console.log(`%c[${this.getName()}]%c v${this.getVersion()} enabled`, "color: #3a71c1; font-weight: 700;", "");
        }
        
        /**
         * plugin stop function
         */
        stop() {

            // revert all patches
            for (const f of Object.values(Patches)) {
                f();
            }

            // force update
            this.forceUpdateAll();

            // show toast
            BdApi.showToast(`Stopped Emulating`, {type: "info", timeout: 5000});

            // console output
            console.log(`%c[${this.getName()}]%c v${this.getVersion()} disabled`, "color: #3a71c1; font-weight: 700;", "");
        }


        /**
         * force update app & close settings
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