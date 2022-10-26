import {createSettings, Data} from "dium";

export interface FolderData {
    icon: string;
    always: boolean;
}

export const Settings = createSettings({
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>
});

// backwards compatibility for old bd version
const oldFolders = Data.load("folders");
if (oldFolders) {
    Data.deleteEntry("folders");
    Settings.update({folders: oldFolders as Record<number, FolderData>});
}
