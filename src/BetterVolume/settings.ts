import {createSettings} from "dium";
import {MediaEngineContext, Snowflake} from "@dium/modules";

export interface Settings {
    volumeOverrides: Record<Snowflake, Record<MediaEngineContext, number>>;

    /** @deprecated legacy */
    disableExperiment: null | boolean;
}

export const Settings = createSettings<Settings>({
    volumeOverrides: {},
    disableExperiment: null
});

export const hasOverride = (userId: Snowflake, context: MediaEngineContext): boolean => context in (Settings.current.volumeOverrides[userId] ?? {});

export const updateVolumeOverride = (userId: Snowflake, volume: number, context: MediaEngineContext): boolean => {
    const isNew = !hasOverride(userId, context);
    Settings.update(({volumeOverrides}) => {
        volumeOverrides[userId] = {[context]: volume, ...volumeOverrides[userId]};
        return {volumeOverrides};
    });
    return isNew;
};

export const tryResetVolumeOverride = (userId: Snowflake, context: MediaEngineContext): boolean => {
    if (hasOverride(userId, context)) {
        Settings.update(({volumeOverrides}) => {
            delete volumeOverrides[userId][context];
            if (Object.keys(volumeOverrides[userId]).length === 0) {
                delete volumeOverrides[userId];
            }
            return {volumeOverrides};
        });
        return true;
    }
    return false;
};
