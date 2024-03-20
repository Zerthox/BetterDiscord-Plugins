import {createSettings} from "dium";
import {Snowflake} from "@dium/modules";

export interface Settings {
    volumeOverrides: Record<Snowflake, number>;

    /** @deprecated legacy */
    disableExperiment: null | boolean;
}

export const Settings = createSettings<Settings>({
    volumeOverrides: {},
    disableExperiment: null
});

export const hasOverride = (userId: Snowflake): boolean => userId in Settings.current.volumeOverrides;

export const updateVolumeOverride = (userId: Snowflake, volume: number): boolean => {
    const isNew = !hasOverride(userId);
    Settings.update(({volumeOverrides}) => {
        volumeOverrides[userId] = volume;
        return {volumeOverrides};
    });
    return isNew;
};

export const tryResetVolumeOverride = (userId: Snowflake): boolean => {
    if (hasOverride(userId)) {
        Settings.update(({volumeOverrides}) => {
            delete volumeOverrides[userId];
            return {volumeOverrides};
        });
        return true;
    }
    return false;
};
