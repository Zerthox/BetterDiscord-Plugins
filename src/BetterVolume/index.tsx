import {createPlugin, Finder, Filters, React} from "dium";
import {MediaEngineStore, MediaEngineActions, MediaEngineContext} from "dium/modules";
import {Menu} from "dium/components";
import type {Snowflake} from "dium/modules";
import styles from "./styles.scss";

interface AudioConvert {
    amplitudeToPerceptual(amplitude: number): number;
    perceptualToAmplitude(perceptual: number): number;
}

const AudioConvert: AudioConvert = Finder.byProps(["perceptualToAmplitude"]);

const limit = (input: number, min: number, max: number): number => Math.min(Math.max(input, min), max);

interface NumberInputProps {
    value: number;
    min: number;
    max: number;
    fallback: number;
    onChange(value: number): void;
}

const NumberInput = ({value, min, max, fallback, onChange}: NumberInputProps): JSX.Element => {
    const [isEmpty, setEmpty] = React.useState(false);

    return (
        <div className="container-BetterVolume">
            <input
                type="number"
                className="input-BetterVolume"
                min={min}
                max={max}
                value={!isEmpty ? Math.round((value + Number.EPSILON) * 100) / 100 : ""}
                onChange={({target}) => {
                    const value = limit(parseFloat(target.value), min, max);
                    const isNaN = Number.isNaN(value);
                    setEmpty(isNaN);
                    if (!isNaN) {
                        onChange(value);
                    }
                }}
                onBlur={() => {
                    if (isEmpty) {
                        setEmpty(false);
                        onChange(fallback);
                    }
                }}
            />
            <span className="unit-BetterVolume">%</span>
        </div>
    );
};

export default createPlugin({styles}, ({Lazy, Patcher}) => ({
    async start() {
        // wait for context menu lazy load
        const useUserVolumeItem = await Lazy.waitFor(Filters.byName("useUserVolumeItem"), false) as {default: (userId: Snowflake, context: MediaEngineContext) => JSX.Element};

        // add number input
        Patcher.after(useUserVolumeItem, "default", ({args: [userId, context], result}) => {
            // check for original render
            if (result) {
                // we can read this directly, the original has a hook to ensure updates
                const volume = MediaEngineStore.getLocalVolume(userId, context);

                return (
                    <>
                        {result}
                        <Menu.Item
                            id="user-volume-input"
                            render={() => (
                                <NumberInput
                                    value={AudioConvert.amplitudeToPerceptual(volume)}
                                    min={0}
                                    max={999999}
                                    fallback={100}
                                    onChange={(value) => MediaEngineActions.setLocalVolume(
                                        userId,
                                        AudioConvert.perceptualToAmplitude(value),
                                        context
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
