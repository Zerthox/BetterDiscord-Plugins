import {Logger, React, Utils, getMeta} from "dium";
import {ExperimentStore} from "@dium/modules";
import {Text} from "@dium/components";
import {Settings} from "./settings";

const AUDIO_EXPERIMENT = "2022-09_remote_audio_settings";

let initialAudioBucket = -1;

export const hasExperiment = (): boolean => initialAudioBucket > 0;

const setAudioBucket = (bucket: number): void => {
    Logger.log("Changing experiment bucket to", bucket);
    const audioExperiment = ExperimentStore.getUserExperimentDescriptor(AUDIO_EXPERIMENT);
    if (audioExperiment) {
        audioExperiment.bucket = bucket;
    }
};

// update on settings change
Settings.addListener(({disableExperiment}) => setAudioBucket(disableExperiment ? 0 : initialAudioBucket));

const onLoadExperiments = (): void => {
    // initialize bucket
    initialAudioBucket = ExperimentStore.getUserExperimentBucket(AUDIO_EXPERIMENT);
    Logger.log("Initial experiment bucket", initialAudioBucket);

    if (hasExperiment()) {
        const {disableExperiment} = Settings.current;
        // check if we have to disable
        if (disableExperiment) {
            // simply setting this should be fine, seems to be only changed on connect etc.
            setAudioBucket(0);
        } else if (disableExperiment === null) {
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
    }
};

export const handleExperiment = (): void => {
    if (ExperimentStore.hasLoadedExperiments) {
        Logger.log("Experiments already loaded");
        onLoadExperiments();
    } else {
        Logger.log("Waiting for experiments load");
        const listener = () => {
            if (ExperimentStore.hasLoadedExperiments) {
                Logger.log("Experiments loaded after wait");
                ExperimentStore.removeChangeListener(listener);
                onLoadExperiments();
            }
        };
        ExperimentStore.addChangeListener(listener);
    }
};

export const resetExperiment = (): void => {
    // reset experiment to initial bucket
    if (Settings.current.disableExperiment) {
        setAudioBucket(initialAudioBucket);
    }
};
