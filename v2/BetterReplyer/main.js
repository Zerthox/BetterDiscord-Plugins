/**
 * BetterRepyler plugin module
 * @author Zerthox
 * @version 0.3.0
 */
module.exports = (Plugin, Api, Vendor) => {

    // import utils
    const Utils = require("./utils")(Api);

    // Api constants
    const Logger = Api.Logger,
        Styles = Api.CssUtils,
        React = Api.ReactHelpers.React,
        Discord = Api.DiscordApi;

    // initialize selectors
    const Sel = Utils.Selectors;
    Sel.find("textArea", ["channelTextArea"]);
    Sel.find("containerCozy", ["message"]);

    /**
     * plugin state
     */
    const State = Utils.initState({
        focused: null,
        warned: false
    });

    /**
     * component storage
     */
    const Comp = Utils.ComponentManager({
        message: "Message",
        textarea: "ChannelTextArea"
    });
 
    // return plugin class
    return class extends Plugin {

        /**
         * plugin start function
         */
        onStart() {

            // inject css
            Styles.injectStyle("main", Sel.process(Utils.files.read("styles.scss")));
               
            // patch message renderCozy
            Comp.patch("message", "renderCozy", function() {
  
                // get old return value
                let r = Comp.message.old.renderCozy.apply(this);

                // break execution if no header
                if (!this.props.isHeader) {
                    return r;
                }

                // get author id
                const id = this.props.message.author.id;
                
                // check if message not from current user & current user has permission to send messages
                if (id != Discord.currentUser.id && (!Discord.currentChannel.permissions || Discord.currentChannel.permissions.toString(2).slice(-12, -11) === "1")) {
                    
                    // get mention string
                    let m = `<@!${id}>`;
                    
                    // create reply button element
                    const e = React.createElement("span", {
                        className: "replyer",
                        onClick: () => {

                            // check if textarea component has been found
                            if (Comp.textarea.found) {

                                // check for saved textarea
                                if (State.focused) {
    
                                    // get saved textarea
                                    const t = State.focused;
    
                                    // focus textarea
                                    t.focus();
    
                                    // insert mention
                                    document.execCommand("insertText", false, m);
    
                                    // update focused state after 100ms
                                    setTimeout(() => {
                                        State.set({focused: t});
                                    }, 100);
                                }
                                else {
    
                                    // get last added textarea
                                    const t = Comp.textarea.stateNodes[Comp.textarea.stateNodes.length - 1]._ref._textArea;
                                    
                                    // focus textarea
                                    t.focus();
    
                                    // save selection
                                    let ts = t.selectionStart + m.length,
                                        te = t.selectionEnd + m.length;
                        
                                    // move to start of textarea
                                    t.selectionStart =  t.selectionEnd = 0;
    
                                    // insert mention
                                    document.execCommand("insertText", false, m + " ");
    
                                    // move to saved selection
                                    t.setSelectionRange(ts, te);
    
                                    // update focused state after 100ms
                                    setTimeout(() => {
                                        State.set({focused: t});
                                    }, 100);
                                }
                            }
                            else {

                                // console warning
                                if (!State.warned) {
                                    Logger.warn(`Failed to find "ChannelTextArea" component`);
                                    State.set({warned: true});
                                }

                                // default to first textarea found
                                const t = document.querySelector(Sel.storage.textArea);

                                // focus textarea
                                t.focus();
    
                                // save selection
                                let ts = t.selectionStart + m.length,
                                    te = t.selectionEnd + m.length;
                    
                                // move to start of textarea
                                t.selectionStart =  t.selectionEnd = 0;

                                // insert mention
                                document.execCommand("insertText", false, m + " ");

                                // move to saved selection
                                t.setSelectionRange(ts, te);
                            }
                        }
                    }, "REPLY");
                    
                    // append reply button element
                    r.props.children[0].props.children[1].props.children.push(e);
                }

                // return modified return value
                return r;
            });

            // patch textarea render
            Comp.patch("textarea", "render", function() {

                // get this
                let t = this;

                // save old handler
                const b = t.props.onBlur;

                // change onBlur
                t.props.onBlur = function() {

                    // call old handler
                    b && b.apply(this);

                    // update focused state
                    State.set({focused: t._ref._textArea});

                    // reset state after 100ms
                    setTimeout(() => {
                        if (State.focused === t._ref._textArea) {
                            State.set({focused: null});
                        }
                    }, 100);
                };

                // return render with modified this
                return Comp.textarea.old.render.apply(t);
            });
            
            // console output
            Logger.log(`Enabled`);
        }

        /**
         * plugin stop function
         */
        onStop() {

            // remove CSS
            Styles.deleteAllStyles();

            // reset state
            State.reset();
            
            // unpatch message renderCozy
            Comp.unpatch("message", "renderCozy");

            // unpatch textarea render
            Comp.unpatch("textarea", "render");

            // console output
            Logger.log(`Disabled`);
        }

    };
}