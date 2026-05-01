import { createSettings } from "dium";

export interface FolderData {
    icon: string | null;
    always: boolean;
}

export const Settings = createSettings({
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>,
});
