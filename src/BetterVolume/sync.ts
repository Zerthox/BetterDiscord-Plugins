import {Finder, Filters, Flux, Logger} from "dium";
import {Snowflake, Dispatcher, MediaEngineContext, AudioConvert} from "@dium/modules";
import {Settings, updateVolumeOverride as updateVolumeOverride, tryResetVolumeOverride} from "./settings";

const enum ActionType {
    AUDIO_SET_LOCAL_VOLUME = "AUDIO_SET_LOCAL_VOLUME",
    USER_SETTINGS_PROTO_UPDATE = "USER_SETTINGS_PROTO_UPDATE"
}

const MAX_VOLUME_PERC = 200;

const MAX_VOLUME_AMP = AudioConvert.perceptualToAmplitude(MAX_VOLUME_PERC);

export const dispatchVolumeOverrides = (): void => {
    Logger.log("Dispatching volume overrides");
    for (const [userId, contexts] of Object.entries(Settings.current.volumeOverrides)) {
        for (const [context, volume] of Object.entries(contexts)) {
            Dispatcher.dispatch<SetVolumeAction>({
                type: ActionType.AUDIO_SET_LOCAL_VOLUME,
                userId,
                context,
                volume
            });
        }
    }
};

interface SetVolumeAction extends Flux.Action {
    type: ActionType.AUDIO_SET_LOCAL_VOLUME;
    userId: Snowflake;
    volume: number;
    context: MediaEngineContext;
}

const settingsUpdateHandler = (_action: Flux.Action) => dispatchVolumeOverrides();

interface AudioSettingsManager {
    actions: Record<string, Flux.ActionHandler> & {
        AUDIO_SET_LOCAL_VOLUME: Flux.ActionHandler<SetVolumeAction>;
    };
    initializedCount: number;
    stores: Map<any, any>;
}

let originalHandler = null;

const wrappedSettingsManagerHandler: Flux.ActionHandler<SetVolumeAction> = (action) => {
    const {userId, volume, context} = action;
    const isOverCap = volume > MAX_VOLUME_AMP;
    if (isOverCap) {
        const isNew = updateVolumeOverride(userId, volume, context);
        if (isNew) {
            Logger.log(`New volume override ${AudioConvert.amplitudeToPerceptual(volume)} for user ${userId} context ${context}`);
            originalHandler({...action, volume: MAX_VOLUME_AMP});
        }
    } else {
        const wasRemoved = tryResetVolumeOverride(userId, context);
        if (wasRemoved) {
            Logger.log(`Removed volume override for user ${userId} context ${context}`);
        }
        originalHandler(action);
    }
};

const trySwapHandler = <A extends Flux.Action>(action: Flux.Action["type"], prev: Flux.ActionHandler<A>, next: Flux.ActionHandler<A>): boolean => {
    const isPresent = Dispatcher._subscriptions[action].has(prev);
    if (isPresent) {
        Dispatcher.unsubscribe(action, prev);
        Dispatcher.subscribe(action, next);
    }
    return isPresent;
};

const hasSetVolume = Filters.byKeys(ActionType.AUDIO_SET_LOCAL_VOLUME);

export const handleVolumeSync = (): void => {
    Dispatcher.subscribe(ActionType.USER_SETTINGS_PROTO_UPDATE, settingsUpdateHandler);
    Logger.log(`Subscribed to ${ActionType.USER_SETTINGS_PROTO_UPDATE} events`);

    // TODO: needed on connection open?
    dispatchVolumeOverrides();

    Finder.waitFor((exported) => exported.actions && hasSetVolume(exported.actions)).then((AudioSettingsManager: AudioSettingsManager) => {
        originalHandler = AudioSettingsManager.actions[ActionType.AUDIO_SET_LOCAL_VOLUME];
        const swapped = trySwapHandler(ActionType.AUDIO_SET_LOCAL_VOLUME, originalHandler, wrappedSettingsManagerHandler);
        if (swapped) {
            Logger.log(`Replaced ${ActionType.AUDIO_SET_LOCAL_VOLUME} handler`);
        } else {
            Logger.warn(`${ActionType.AUDIO_SET_LOCAL_VOLUME} handler not present`);
        }
    });
};

export const resetVolumeSync = (): void => {
    Dispatcher.unsubscribe(ActionType.USER_SETTINGS_PROTO_UPDATE, settingsUpdateHandler);
    Logger.log(`Unsubscribed from ${ActionType.USER_SETTINGS_PROTO_UPDATE} events`);

    const swapped = trySwapHandler(ActionType.AUDIO_SET_LOCAL_VOLUME, wrappedSettingsManagerHandler, originalHandler);
    if (swapped) {
        Logger.log(`Reset ${ActionType.AUDIO_SET_LOCAL_VOLUME} handler`);
    }
};
