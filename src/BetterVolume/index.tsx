import {createPlugin, createSettings, Finder, Filters, Patcher, React, Utils, getMeta} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineActions, MediaEngineContext, ExperimentStore} from "@dium/modules";
import {MenuItem, Text, SwitchItem} from "@dium/components";
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

const AUDIO_EXPERIMENT = "2022-09_remote_audio_settings";
const initialAudioBucket = ExperimentStore.getUserExperimentBucket(AUDIO_EXPERIMENT);
const hasAudioExperiment = initialAudioBucket > 0;
const setAudioBucket = (bucket: number) => {
    const audioExperiment = ExperimentStore.getUserExperimentDescriptor(AUDIO_EXPERIMENT);
    if (audioExperiment) {
        audioExperiment.bucket = bucket;
    }
};

const Settings = createSettings({
    disableExperiment: null
});
Settings.addListener(({disableExperiment}) => setAudioBucket(disableExperiment ? 0 : initialAudioBucket));

export default createPlugin({
    start() {
        // check for audio settings experiment
        if (hasAudioExperiment) {
            if (Settings.current.disableExperiment === null) {
                // initial value means we set to false and ask the user
                Settings.update({disableExperiment: false});
                Utils.confirm(getMeta().name, (
                    <Text color="text-normal">
                        Your client has an experiment interfering with volumes greater than 200% enabled.
                        Do you wish to disable it now and on future restarts?
                    </Text>
                ), {
                    onConfirm: () => Settings.update({disableExperiment: true})
                });
            }

            // check if we have to disable
            if (Settings.current.disableExperiment) {
                // simply setting this should be fine, seems to be only changed on connect etc.
                setAudioBucket(0);
            }
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
    stop() {
        // reset experiment to initial bucket
        if (Settings.current.disableExperiment) {
            setAudioBucket(initialAudioBucket);
        }
    },
    styles: css,
    Settings,
    SettingsPanel: () => {
        const [{disableExperiment}, setSettings] = Settings.useState();

        return (
            <SwitchItem
                note="Force disable experiment interfering with volumes greater than 200%."
                hideBorder
                value={disableExperiment}
                disabled={!hasAudioExperiment}
                onChange={(checked) => setSettings({disableExperiment: checked})}
            >Disable Audio experiment</SwitchItem>
        );
    }
});
