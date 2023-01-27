import {createPlugin, Finder, Filters, Patcher, React} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineActions, MediaEngineContext} from "@dium/modules";
import {MenuItem} from "@dium/components";
import {NumberInput} from "./input";
import {css} from "./styles.module.scss";

interface AudioConvert {
    amplitudeToPerceptual(amplitude: number): number;
    perceptualToAmplitude(perceptual: number): number;
}

const AudioConvert: AudioConvert = Finder.demangle({
    amplitudeToPerceptual: Filters.bySource("Math.log10"),
    perceptualToAmplitude: Filters.bySource("Math.pow(10")
});

type UseUserVolumeItem = (userId: Snowflake, context: MediaEngineContext) => JSX.Element;

export default createPlugin({
    async start() {
        // wait for context menu lazy load
        const filter = Filters.bySource("user-volume");
        const useUserVolumeItem = Finder.resolveKey(
            await Finder.waitFor(filter, {resolve: false}) as Record<string, UseUserVolumeItem>,
            filter
        );

        // add number input
        Patcher.after(...useUserVolumeItem, ({args: [userId, context], result}) => {
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
    styles: css
});
