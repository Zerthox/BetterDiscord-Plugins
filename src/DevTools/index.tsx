import * as dium from "dium";
import {React} from "dium";
import {UserStore, UserFlag} from "dium/modules";
import {SwitchItem} from "dium/components";
import * as Modules from "dium/modules";
import * as Components from "dium/components";
import * as DevFinder from "./finder";

const settings = {
    global: true,
    developer: false,
    staff: false
};

// add extensions
const diumGlobal = {
    ...dium,
    Finder: {...dium.Finder, dev: DevFinder},
    Modules,
    Components
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
        user.flags |= UserFlag.STAFF;
    } else {
        user.flags &= ~UserFlag.STAFF;
    }
    UserStore.emitChange();
};

export default dium.createPlugin({settings}, ({Settings}) => ({
    start() {
        // expose global
        updateGlobal(true);
    },
    stop() {
        // remove global
        updateGlobal(false);
    },
    SettingsPanel: () => {
        const [settings, setSettings] = Settings.useState();

        return (
            <>
                <SwitchItem
                    value={settings.global}
                    onChange={(checked) => {
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
                    onChange={(checked) => {
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
