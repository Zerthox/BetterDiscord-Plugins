import {createPlugin, Finder, Filters, Patcher, React} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineActions, MediaEngineContext, ExperimentStore} from "@dium/modules";
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
    start() {
        // disable remote audio settings experiment
        const audioExperiment = ExperimentStore.getUserExperimentDescriptor("2022-09_remote_audio_settings");
        if (audioExperiment) {
            // simply setting this should be fine, seems to be only changed on connect etc.
            audioExperiment.bucket = 0;
        }

        // add number input to user volume item
        const useUserVolumeItemFilter = Filters.bySource("user-volume");
        Finder.waitFor(useUserVolumeItemFilter, {resolve: false}).then((result: Record<string, UseUserVolumeItem>) => {
            const useUserVolumeItem = Finder.resolveKey(result, useUserVolumeItemFilter);
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
        });
    },
    styles: css
});
