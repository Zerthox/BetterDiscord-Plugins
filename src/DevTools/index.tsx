import * as dium from "dium";
import {UserStore, SwitchItem, Constants} from "dium/modules";
import * as Modules from "dium/modules";
import * as DevFinder from "./finder";
import config from "./config.json";
import type {UntypedStore} from "dium/modules";

const {React, Finder} = dium;

const {UserFlags} = Constants;
const DeveloperExperimentStore: UntypedStore = Finder.byProps("isDeveloper");

const settings = {
    global: true,
    developer: true,
    staff: true
};

// add extensions
const diumGlobal = {
    ...dium,
    Finder: {...Finder, dev: DevFinder},
    Modules
};

declare global {
    interface Window {
        dium?: typeof diumGlobal;
    }
}

const updateGlobal = (expose: boolean) => {
    if (expose) {
        window.dium = diumGlobal;
    } else {
        delete window.dium;
    }
};

const origDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(DeveloperExperimentStore), "isDeveloper");

const updateStaffFlag = (flag: boolean) => {
    const user = UserStore.getCurrentUser();
    if (flag) {
        user.flags |= UserFlags.STAFF;
    } else {
        user.flags &= ~UserFlags.STAFF;
    }
    UserStore.emitChange();
};

export default dium.createPlugin({...config, settings}, ({Settings}) => ({
    start() {
        // expose global
        updateGlobal(Settings.current.global);

        // replace developer getter
        Object.defineProperty(Object.getPrototypeOf(DeveloperExperimentStore), "isDeveloper", {
            ...origDesc,
            get: () => Settings.current.developer
        });
        DeveloperExperimentStore.emitChange();

        // update flag
        updateStaffFlag(Settings.current.staff);
    },
    stop() {
        // remove global
        updateGlobal(false);

        // reset developer getter
        Object.defineProperty(Object.getPrototypeOf(DeveloperExperimentStore), "isDeveloper", {...origDesc});
        DeveloperExperimentStore.emitChange();

        // reset flag
        updateStaffFlag(false);
    },
    SettingsPanel: () => {
        const [settings, setSettings] = Settings.useState();

        return (
            <>
                <SwitchItem
                    value={settings.global}
                    onChange={(checked: boolean) => {
                        setSettings({global: checked});
                        updateGlobal(checked);
                    }}
                    note="Expose dium as global for development."
                >Dium Global</SwitchItem>
                <SwitchItem
                    value={settings.developer}
                    onChange={(checked: boolean) => {
                        setSettings({developer: checked});
                        DeveloperExperimentStore.emitChange();
                    }}
                    note="Enable experiments &amp; other developer tabs in settings. Reopen to see them."
                >Enable Developer Experiments</SwitchItem>
                <SwitchItem
                    value={settings.staff}
                    onChange={(checked: boolean) => {
                        setSettings({staff: checked});
                        updateStaffFlag(checked);
                    }}
                    note="Add the Staff flag to the current user."
                    hideBorder
                >Enable Staff flag</SwitchItem>
            </>
        );
    }
}));
