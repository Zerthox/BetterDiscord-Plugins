# Dium
A work-in-progress framework for Discord plugins.

Eventually, this might be moved to its own repository.

**Important:** This library relies heavily on tree-shaking (dead code elimination) to eliminate searches for unused modules.

```tsx
/**
 * @name Example
 * @version 0.1.0
 * @author Zerthox
 * @description Example plugin using dium.
 */

import {
    createPlugin,
    Finder,
    Filters,
    Utils,
    React,
    ReactInternals,
    ReactDOM,
    ReactDOMInternals,
    Flux
} from "dium";
import {classNames, lodash} from "@dium/modules";

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

export default createPlugin(config, ({Logger, Lazy, Patcher, Styles, Data, Settings}) => {
    return {
        start: async () => {
            // do something on plugin start
        },
        stop: () => {
            // do something on plugin stop
        },
        SettingsPanel: () => {
            // use settings via hook
            const [settings, setSettings] = Settings.useState();

            // render settings panel
            return (
                <div className="example-container">
                    <div className="example-setting">
                        Setting is {settings.enabled ? "enabled" : "disabled"}
                    </div>
                    <div
                        className="example-clickable"
                        onClick={() => setSettings({enabled: !settings.enabled})}
                    >Click to toggle</div>
                </div>
            );
        }
    };
});
```
