import {createPlugin, React, Finder, Flux} from "discordium";
import {Discord} from "discordium/types";
import config from "./config.json";
import styles from "./styles.scss";

const {MenuItem} = Finder.byProps("MenuGroup", "MenuItem", "MenuSeparator") ?? {};
const SettingsStore = Finder.byProps("getLocalVolume");
const SettingsActions = Finder.byProps("setLocalVolume");
const AudioConvert = Finder.byProps("perceptualToAmplitude");
const useUserVolumeItem = Finder.raw.byName("useUserVolumeItem")?.exports as {default: (userId: Discord.Snowflake, mediaContext: any) => JSX.Element};

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

export default createPlugin({...config, styles}, ({Patcher}) => ({
    start() {
        Patcher.after(useUserVolumeItem, "default", ({args: [userId, mediaContext], result}) => {
            // check for original render
            if (result) {
                const volume = Flux.useStateFromStores(
                    [SettingsStore],
                    () => SettingsStore.getLocalVolume(userId, mediaContext),
                    [userId, mediaContext]
                );

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
    },
    stop() {}
}));
