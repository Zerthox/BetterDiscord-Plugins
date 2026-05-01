import { createPlugin, createSettings, Logger, Finder, Patcher, Utils, React } from "dium";
import { Platforms, PlatformType } from "@dium/modules";

const { PlatformTypes: PlatformType } = Platforms;
const OverlayBridgeStore = Finder.byName("OverlayBridgeStore");

const RadioGroup = Finder.byName("RadioGroup");

const Settings = createSettings({
    platform: null, // TODO: get platform
});

const notify = (message: string, options: Utils.ToastOptions) => {
    Logger.log(message);
    Utils.toast(message, options);
};

const triggerRerender = async () => {
    // TODO: force update root & trigger helmet rerender
};

const changePlatform = async (platform: any) => {
    Settings.update({ platform });
    await triggerRerender();
    const platformName = Platforms.isWindows()
        ? "Windows"
        : Platforms.isOSX()
          ? "MacOS"
          : Platforms.isLinux()
            ? "Linux"
            : "Browser";
    notify(`Emulating ${platformName}`, { type: Utils.ToastType.Info, timeout: 5000 });
};

export default createPlugin({
    start() {
        // patch platform specific getters
        for (const platform of ["Windows", "OSX", "Linux", "Web"] as const) {
            Patcher.instead(
                Platforms,
                `is${platform}`,
                () => Settings.current.platform === PlatformType[platform.toUpperCase() as PlatformType],
            );
        }

        // patch overlay requirement
        Patcher.instead(OverlayBridgeStore, "isSupported", () => Platforms.isWindows());
    },
    async stop() {
        await triggerRerender();
        notify("Stopped emulating", { type: Utils.ToastType.Info, timeout: 5000 });
    },
    Settings,
    SettingsPanel: () => {
        const { platform } = Settings.useCurrent();

        return (
            <RadioGroup
                value={platform}
                onChange={({ value }: { value: any }) => changePlatform(value)}
                options={[
                    { value: PlatformType.WINDOWS, name: "Windows" },
                    { value: PlatformType.OSX, name: "MacOS" },
                    { value: PlatformType.LINUX, name: "Linux" },
                    { value: PlatformType.WEB, name: "Browser" },
                ]}
            />
        );
    },
});
