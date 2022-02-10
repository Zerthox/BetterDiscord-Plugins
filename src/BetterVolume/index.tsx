import {createPlugin, React, Finder, Modules, Discord} from "discordium";
import config from "./config.json";
import styles from "./styles.scss";

const {MenuItem} = Modules.Menu;
const SettingsStore = Finder.byProps("getLocalVolume");
const SettingsActions = Finder.byProps("setLocalVolume");
const AudioConvert = Finder.byProps("perceptualToAmplitude");

const limit = (input: number, min: number, max: number): number => Math.min(Math.max(input, min), max);

interface NumberInputProps {
    value: number;
    min: number;
    max: number;
    fallback: number;
    onChange(value: number): void;
}

const NumberInput = ({value, min, max, fallback, onChange}: NumberInputProps): JSX.Element => (
    <div className="container-BetterVolume">
        <input
            type="number"
            className="input-BetterVolume"
            min={min}
            max={max}
            value={Math.round((value + Number.EPSILON) * 100) / 100}
            onChange={({target}) => onChange(limit(parseFloat(target.value), min, max))}
            onBlur={({target}) => {
                const value = limit(parseFloat(target.value), min, max);
                if (Number.isNaN(value)) {
                    onChange(fallback);
                }
            }}
        />
        <span className="unit-BetterVolume">%</span>
    </div>
);

export default createPlugin({...config, styles}, ({Patcher}) => ({
    async start() {
        // wait for context menu lazy load
        const useUserVolumeItem = await Patcher.waitForContextMenu(
            () => Finder.query({name: "useUserVolumeItem"}) as {default: (userId: Discord.Snowflake, mediaContext: any) => JSX.Element}
        );

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
                                    value={AudioConvert.amplitudeToPerceptual(volume)}
                                    min={0}
                                    max={999999}
                                    fallback={100}
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
