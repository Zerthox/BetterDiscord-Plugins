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
        settingsPanel: (currentSettings) => {
            // render settings
            return (
                <div className="example-container">
                    <div className="example-setting">
                        Setting is {currentSettings.enabled ? "enabled" : "disabled"}
                    </div>
                    <div
                        className="example-clickable"
                        onClick={() => Settings.set({enabled: !currentSettings.enabled})}
                    >
                        Click to toggle
                    </div>
                </div>
            );
        }
    };
});
```
