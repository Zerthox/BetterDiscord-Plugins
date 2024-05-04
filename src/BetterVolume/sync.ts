import {Finder, Filters, Flux, Logger} from "dium";
import {Snowflake, Dispatcher, MediaEngineContext, AudioConvert, MediaEngineContextType} from "@dium/modules";
import {Settings, updateVolumeOverride as updateVolumeOverride, tryResetVolumeOverride} from "./settings";

const enum ActionType {
    AUDIO_SET_LOCAL_VOLUME = "AUDIO_SET_LOCAL_VOLUME",
    USER_SETTINGS_PROTO_UPDATE = "USER_SETTINGS_PROTO_UPDATE"
}

const MAX_VOLUME_PERC = 200;

const MAX_VOLUME_AMP = AudioConvert.perceptualToAmplitude(MAX_VOLUME_PERC);

export const dispatchVolumeOverrides = (): void => {
    for (const [userId, volume] of Object.entries(Settings.current.volumeOverrides)) {
        Dispatcher.dispatch<SetVolumeAction>({
            type: ActionType.AUDIO_SET_LOCAL_VOLUME,
            context: MediaEngineContextType.DEFAULT,
            userId,
            volume
        });
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

const wrappedSettingsManagerHandler: Flux.ActionHandler<SetVolumeAction> = (action) => {
    // TODO: handle contexts
    const isOverCap = action.volume > MAX_VOLUME_AMP;
    if (isOverCap) {
        const isNew = updateVolumeOverride(action.userId, action.volume);
        if (isNew) {
            Logger.log(`New volume override ${AudioConvert.amplitudeToPerceptual(action.volume)} for user ${action.userId}`);
            originalHandler({...action, volume: MAX_VOLUME_AMP});
        }
    } else {
        const wasRemoved = tryResetVolumeOverride(action.userId);
        if (wasRemoved) {
            Logger.log(`Removed volume override for user ${action.userId}`);
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

let originalHandler = null;

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
