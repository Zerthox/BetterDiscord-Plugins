import {createPlugin, Finder, Filters, Patcher, React} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineActions, MediaEngineContext} from "@dium/modules";
import {MenuItem, FormSwitch} from "@dium/components";
import {Settings} from "./settings";
import {NumberInput} from "./input";
import {handleExperiment, hasExperiment, resetExperiment} from "./experiment";
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
        // handle audio experiment
        handleExperiment();

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
    stop() {
        resetExperiment();
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{disableExperiment}, setSettings] = Settings.useState();

        return (
            <FormSwitch
                note="Force disable experiment interfering with volumes greater than 200%."
                hideBorder
                value={disableExperiment}
                disabled={hasExperiment()}
                onChange={(checked) => setSettings({disableExperiment: checked})}
            >Disable Audio experiment</FormSwitch>
        );
    }
});
