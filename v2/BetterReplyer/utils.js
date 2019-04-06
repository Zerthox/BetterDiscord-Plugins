/**
 * BetterDiscord plugin utilities
 * @param {*} Api BetterDiscord Api
 * @author Zerthox
 * @version 0.2.1
 */
module.exports = (Api) => {

    // require constants
    const fs = require("fs"),
        path = require("path")
        rimraf = require("rimraf");

    // Api constants
    const Logger = Api.Logger,
        Module = Api.Reflection.module;

    // return utils object
    return {

        /**
         * utilities for reading plugin path
         */
        files: {

            /**
             * read file from plugin path synchronously
             * @param {string} f filename or relative path to file
             * @return {string} file contents or null if file not found
             */
            read(f) {
                try {

                    // return file contents if possible
                    return fs.readFileSync(path.resolve(Api.pluginPath, f)).toString();
                }
                catch (e) {

                    // return null if error
                    return null;
                }
            },

            /**
             * list all files in plugin path synchronously
             * @return {string[]} file names
             */
            list() {
                return fs.readdirSync(path.resolve(Api.pluginPath));
            }
        },

        /**
         * utilities for Discord selectors
         */
        Selectors: {

            /**
             * selector storage
             */
            storage: {},

            /**
             * attempt to find & store selector, if `t` is left out it will default to `n`
             * @param {string} n name
             * @param {string} t target
             * @param {string[]} s specifications array
             * @return {string} selector
             */
            find(n, t, s = []) {

                // check if no target passed
                if (t instanceof Array) {

                    // copy specifications array
                    s = t.slice(0);

                    // set target to passed name
                    t = n;
                }

                // check if selector already stored
                if (!this.storage[n]) {

                    // attempt to find module containing selector & specifications
                    const m = Module.byProps(t, ...s);

                    // if module found, save selector in storage
                    if (m) {
                        this.storage[n] = `.${m[t].split(" ")[0]}`;
                    }
                }

                // return stored selector
                return this.storage[n];
            },
    
            /**
             * process selector placeholders in a string
             * @param {string} s string to process
             */
            process(s) {
                for (var k in this.storage) {
                    s = s.split(`%${k}`).join(this.storage[k]);
                }
                return s;
            }
        },


        /**
         * initialize a new State instance
         * @param {Object} d default state
         * @return {State} new State instance
         */
        initState(d) {
            return new class State {

                /**
                 * state constructor
                 */
                constructor() {
                    this.reset();
                }

                /**
                 * update state
                 * @param {*} s state object
                 */
                set(s) {
                    for (var k in s) {
                        this[k] = s[k];
                    }
                }

                /**
                 * reset state to default state
                 */
                reset() {
                    for (var k in d) {
                        this[k] = d[k];
                    }
                }
            };
        },

        /**
         * create a new ComponentManager instance
         * @param {Object} c components object
         * @return {ComponentManager} new ComponentManager instance
         */
        ComponentManager(c) {
            return new class ComponentManager {

                constructor(c) {

                    // iterate over passed components
                    for (var k in c) {

                        // initialize component
                        let e = this[k] = {
                            id: c[k],
                            found: false,
                            callbacks: []
                        };

                        // get component asynchronously
                        (async () => {

                            // wait for component
                            const c = await Api.ReactComponents.getComponent(e.id);
                            
                            // update stored component
                            e.component = c.component;
                            e.selector = c.important.selector;
                            e.forceUpdateAll = () => {
                                c.forceUpdateAll();
                            };
                            Object.defineProperty(e, "elements", {
                                get: () => {
                                    return c.elements;
                                }
                            });
                            Object.defineProperty(e, "stateNodes", {
                                get: () => {
                                    return c.stateNodes;
                                }
                            });
                            e.old = {};
                            e.found = true;

                            // call callbacks
                            for (var f of e.callbacks) {
                                f();
                            }

                            // delete callbacks
                            delete e.callbacks;
                        })();
                    }
                }

                /**
                 * 
                 * @param {string} c component
                 * @param {string} p property
                 * @param {function} f patch function
                 */
                patch(c, p, f) {

                    // declare patch action function
                    const a = () => {

                        // save old function
                        this[c].old[p] = this[c].component.prototype[p];

                        // override property
                        this[c].component.prototype[p] = f;

                        // force rerender
                        this[c].forceUpdateAll();

                        // console output
                        let s = Array(this[c].component.prototype[p].length).fill("a").map((a, i) => String.fromCharCode(a.charCodeAt(0) + i)).join(",");
                        Logger.log(`Patched "${this[c].id}" component ${p}(${s.length > 25 ? `${s.slice(0, 26)}...` : s}) function`);
                    };

                    // check if component found
                    if (this[c].found) {
                        
                        // patch directly
                        a();
                    }
                    else {
                        
                        // add callback
                        this[c].callbacks.push(a);
                    }
                }

                /**
                 * unpatch passed property from passed component
                 * @param {string} c component
                 * @param {string} p property
                 */
                unpatch(c, p) {

                    // declare unpatch action function
                    const a = () => {

                        // revert patch
                        this[c].component.prototype[p] = this[c].old[p];

                        // delete save
                        delete this[c].old[p];

                        // force rerender
                        this[c].forceUpdateAll();

                        // console output
                        let s = Array(this[c].component.prototype[p].length).fill("a").map((a, i) => String.fromCharCode(a.charCodeAt(0) + i)).join(",");
                        Logger.log(`Unpatched "${this[c].id}" component ${p}(${s.length > 25 ? `${s.slice(0, 26)}...` : s}) function`);
                    };

                    // check if component found
                    if (this[c].found) {
                        
                        // unpatch directly
                        a();
                    }
                    else {
                        
                        // add callback
                        this[c].callbacks.push(a);
                    }
                }

            }(c);
        }
    };
}