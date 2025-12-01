import { createSettings } from "dium";

export enum FolderIndicatorPosition {
    TopLeft = "topLeft",
    TopRight = "topRight",
    BottomLeft = "bottomLeft",
    BottomRight = "bottomRight",
}

export interface FolderData {
    icon: string;
    always: boolean;
    showFolderIndicator: boolean;
}

export const Settings = createSettings({
    closeOnOpen: false,
    folders: {} as Record<number, FolderData>,
    folderIndicatorPosition: FolderIndicatorPosition.TopLeft,
});
