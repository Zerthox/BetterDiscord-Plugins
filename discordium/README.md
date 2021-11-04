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
    styles: `.example-container {
        color: red;
    }`
    settings: {
        enabled: true
    }
};

export default createPlugin(config, ({Logger, Patcher, Styles}) => {
    return {
        start: async () => {
            // do something on plugin start
        },
        stop: async () => {
            // do something on plugin stop
        },
        settingsPanel: (settings) => {
            // render settings
            return (
                <div class="example-container">
                    Setting is {settings.enabled ? "enabled" : "disabled"}
                </div>
            );
        }
    };
});
```
