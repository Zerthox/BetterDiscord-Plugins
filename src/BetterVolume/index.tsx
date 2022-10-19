import {createPlugin, Finder, Filters, Lazy, Patcher, React} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineActions, MediaEngineContext} from "@dium/modules";
import {MenuItem} from "@dium/components";
import styles from "./styles.scss";

interface AudioConvert {
    amplitudeToPerceptual(amplitude: number): number;
    perceptualToAmplitude(perceptual: number): number;
}

const AudioConvert: AudioConvert = Finder.demangle({
    amplitudeToPerceptual: Filters.bySource("Math.log10"),
    perceptualToAmplitude: Filters.bySource("Math.pow(10")
});

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

type UseUserVolumeItem = (userId: Snowflake, context: MediaEngineContext) => JSX.Element;

export default createPlugin({styles}, () => ({
    async start() {
        // wait for context menu lazy load
        const useUserVolumeItem = await Lazy.waitFor(Filters.bySource("user-volume"), {resolve: false}) as Record<string, UseUserVolumeItem>;
        if (!useUserVolumeItem) {
            return;
        }

        const key = Object.keys(useUserVolumeItem)[0];

        // add number input
        Patcher.after(useUserVolumeItem, key, ({args: [userId, context], result}) => {
            // check for original render
            if (result) {
                // we can read this directly, the original has a hook to ensure updates
                const volume = MediaEngineStore.getLocalVolume(userId, context);

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
        }, {name: "useUserVolumeItem"});
    },
    stop() {}
}));
