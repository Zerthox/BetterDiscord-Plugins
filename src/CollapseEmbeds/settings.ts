import {createSettings} from "dium";

export interface CollapsedState {
    hideByDefault: boolean;
    collapsedStates: {
        [id: string]: {
            collapsed: boolean;
            lastSeen: number;
        }
    };
}

export const Settings = createSettings<CollapsedState>({
    hideByDefault: false,
    collapsedStates: {}
});

// Cleanup function to remove old entries (older than 30 days)
export function cleanupOldEntries() {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    const newStates = {...Settings.current.collapsedStates};
    let hasChanges = false;
    
    for (const [id, state] of Object.entries(newStates)) {
        if (now - state.lastSeen > THIRTY_DAYS) {
            delete newStates[id];
            hasChanges = true;
        }
    }
    
    if (hasChanges) {
        Settings.update({
            hideByDefault: Settings.current.hideByDefault,
            collapsedStates: newStates
        });
    }
}
