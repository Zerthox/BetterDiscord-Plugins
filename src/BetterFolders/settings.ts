import { createSettings } from "dium";

export interface FolderData {
    icon: string;
    always: boolean;
}

export const Settings = createSettings({
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>,
});
