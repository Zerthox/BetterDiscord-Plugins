import {createPlugin, Finder, Utils, React} from "dium";
import {Platforms} from "dium/modules";

const {PlatformTypes} = Platforms;
const OverlayBridgeStore = Finder.byProps("initialize", "isSupported", "getFocusedPID");

const RadioGroup = Finder.byName("RadioGroup");

const settings = {
    platform: null // TODO: get platform
};

export default createPlugin({settings}, ({Logger, Patcher, Settings}) => {
    const notify = (message: string, options: Utils.ToastOptions) => {
        Logger.log(message);
        Utils.toast(message, options);
    };

    const triggerRerender = async () => {
        // TODO: force update root & trigger helmet rerender
    };

    const changePlatform = async (platform: any) => {
        Settings.update({platform});
        await triggerRerender();
        const platformName = Platforms.isWindows() ? "Windows" : Platforms.isOSX() ? "MacOS" : Platforms.isLinux() ? "Linux" : "Browser";
        notify(`Emulating ${platformName}`, {type: Utils.ToastType.Info, timeout: 5000});
    };

    return {
        start() {
            // patch platform specific getters
            for (const platform of ["Windows", "OSX", "Linux", "Web"] as const) {
                Patcher.instead(Platforms, `is${platform}`, () => Settings.current.platform === PlatformTypes[platform.toUpperCase()]);
            }

            // patch overlay requirement
            Patcher.instead(OverlayBridgeStore, "isSupported", () => Platforms.isWindows());
        },
        async stop() {
            await triggerRerender();
            notify("Stopped emulating", {type: Utils.ToastType.Info, timeout: 5000});
        },
        SettingsPanel: () => {
            const {platform} = Settings.useCurrent();

            return (
                <RadioGroup
                    value={platform}
                    onChange={({value}) => changePlatform(value)}
                    options={[
                        {value: PlatformTypes.WINDOWS, name: "Windows"},
                        {value: PlatformTypes.OSX, name: "MacOS"},
                        {value: PlatformTypes.LINUX, name: "Linux"},
                        {value: PlatformTypes.WEB, name: "Browser"}
                    ]}
                />
            );
        }
    };
});
