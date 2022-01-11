import {createPlugin, React, Finder, Modules} from "discordium";
import {Discord} from "discordium/types";
import config from "./config.json";
import styles from "./styles.scss";

const {ContextMenuActions} = Modules;
const {MenuItem} = Modules.Menu;
const SettingsStore = Finder.byProps("getLocalVolume");
const SettingsActions = Finder.byProps("setLocalVolume");
const AudioConvert = Finder.byProps("perceptualToAmplitude");

interface NumberInputProps {
    value: number;
    min: number;
    max: number;
    onChange(value: number): void;
}

const NumberInput = ({value, min, max, onChange}: NumberInputProps): JSX.Element => (
    <div className="container-BetterVolume">
        <input
            type="number"
            min={min}
            max={max}
            value={Math.round((value + Number.EPSILON) * 100) / 100}
            onChange={({target}) => onChange(Math.min(Math.max(parseFloat(target.value), min), max))}
            className="input-BetterVolume"
        />
        <span className="unit-BetterVolume">%</span>
    </div>
);

export default createPlugin({...config, styles}, ({Patcher}) => {
    const findUseUserVolumeItem = () => Finder.raw.byName("useUserVolumeItem")?.exports as {default: (userId: Discord.Snowflake, mediaContext: any) => JSX.Element};

    return {
        start() {
            // listen for lazy context menus
            // TODO: move to framework
            Patcher.before(ContextMenuActions, "openContextMenuLazy", ({args, cancel}) => {
                const original = args[1] as (...args: any[]) => Promise<any>;
                args[1] = async (...args) => {
                    const result = await original(...args);

                    // check if our hook has been loaded
                    const useUserVolumeItem = findUseUserVolumeItem();
                    if (useUserVolumeItem) {
                        // we dont need the patch anymore
                        cancel();

                        // add number input
                        Patcher.after(useUserVolumeItem, "default", ({args: [userId, mediaContext], result}) => {
                            // check for original render
                            if (result) {
                                // we can read this directly, the original has a hook to ensure updates
                                const volume = SettingsStore.getLocalVolume(userId, mediaContext);

                                return (
                                    <>
                                        {result}
                                        <MenuItem
                                            id="user-volume-input"
                                            render={() => (
                                                <NumberInput
                                                    min={0}
                                                    max={999999}
                                                    value={AudioConvert.amplitudeToPerceptual(volume)}
                                                    onChange={(value) => SettingsActions.setLocalVolume(
                                                        userId,
                                                        AudioConvert.perceptualToAmplitude(value),
                                                        mediaContext
                                                    )}
                                                />
                                            )}
                                        />
                                    </>
                                );
                            }
                        });
                    }

                    return result;
                };
            });
        },
        stop() {}
    };
});
