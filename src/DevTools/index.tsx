import * as dium from "dium";
import {Constants, UserStore, SwitchItem} from "dium/modules";
import * as Modules from "dium/modules";
import * as DevFinder from "./finder";

const {React, Finder} = dium;

const {UserFlags} = Constants;

const settings = {
    global: true,
    developer: false,
    staff: false
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

const updateStaffFlag = (flag: boolean) => {
    const user = UserStore.getCurrentUser();
    if (flag) {
        user.flags |= UserFlags.STAFF;
    } else {
        user.flags &= ~UserFlags.STAFF;
    }
    UserStore.emitChange();
};

export default dium.createPlugin({settings}, ({Settings}) => ({
    start() {
        // expose global
        updateGlobal(Settings.current.global);

        try {
            // update flag
            updateStaffFlag(Settings.current.staff);
        } catch (err) {
            console.error(err);
        }
    },
    stop() {
        // remove global
        updateGlobal(false);

        try {
            // reset flag
            updateStaffFlag(false);
        } catch (err) {
            console.error(err);
        }
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
                    disabled // disabled for now
                    value={false}
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
