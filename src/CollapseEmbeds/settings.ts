import {createSettings, Logger} from "dium";

export const DAYS_TO_MILLIS = 24 * 60 * 60 * 1000;

export interface CollapsedState {
    hideByDefault: boolean;
    saveStates: boolean;
    saveDuration: number;
    collapsedStates: {
        [id: string]: {
            shown: boolean;
            lastSeen: number;
        };
    };
}

export const Settings = createSettings<CollapsedState>({
    hideByDefault: false,
    saveStates: true,
    saveDuration: 30 * DAYS_TO_MILLIS,
    collapsedStates: {}
});

export function getCollapsedState(id: string | undefined): boolean {
    const {hideByDefault, saveStates, collapsedStates} = Settings.current;
    if (saveStates && id) {
        return collapsedStates[id]?.shown ?? !hideByDefault;
    } else {
        return !hideByDefault;
    }
}

export function updateCollapsedState(id: string | undefined, shown: boolean): void {
    const {saveStates, collapsedStates} = Settings.current;
    if (saveStates && id) {
        collapsedStates[id] = {
            shown,
            lastSeen: Date.now()
        };
        Settings.update({collapsedStates});
    }
}

export function cleanupOldEntries(): void {
    const {saveDuration, collapsedStates} = Settings.current;
    const oldestAllowed = Date.now() - saveDuration;
    const entries = Object.entries(collapsedStates);

    let count = 0;
    for (const [id, state] of Object.entries(collapsedStates)) {
        if (state.lastSeen < oldestAllowed) {
            delete collapsedStates[id];
            count++;
        }
    }

    Settings.update({collapsedStates});
    Logger.log(`Cleaned ${count} out of ${entries.length} entries`);
}
