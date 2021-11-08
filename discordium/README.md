# Discordium
A work-in-progress framework for Discord plugins.

Eventually, this might be moved to its own repository.

```ts
/**
 * @name Example
 * @version 0.1.0
 * @author Zerthox
 * @description Example plugin using discordium
 */

import {
    createPlugin,
    Finder,
    Utils,
    Modules,
    Discord,
    React,
    ReactInternals,
    ReactDOM,
    ReactDOMInternals,
    Flux,
    classNames,
    lodash
} from "discordium";

const config = {
    name: "Example",
    version: "0.1.0",
    styles: `.example-clickable {
        color: red;
        cursor: pointer;
    }`,
    settings: {
        enabled: false
    }
};

export default createPlugin(config, ({Logger, Patcher, Styles, Data, Settings}) => {
    return {
        start: async () => {
            // do something on plugin start
        },
        stop: async () => {
            // do something on plugin stop
        },
        settingsPanel: (props) => {
            // render settings
            return (
                <div className="example-container">
                    <div className="example-setting">
                        Setting is {props.enabled ? "enabled" : "disabled"}
                    </div>
                    <div
                        className="example-clickable"
                        onClick={() => props.set({enabled: !props.enabled})}
                    >
                        Click to toggle
                    </div>
                </div>
            );
        }
    };
});
```
