import { React, Logger, Utils, PatchDataWithResult } from "dium";
import { SortedGuildStore, GuildsTreeFolder } from "@dium/modules";
import { RadioGroup, FormItem, TextInput } from "@dium/components";
import { BetterFolderUploader } from "./uploader";
import { Settings } from "./settings";

const enum IconType {
    Default = "default",
    Custom = "custom",
}

export interface FolderSettingsProps {
    folderId: number;
    folderName: string;
    folderColor: number;
    transitionState: number;
    onClose: () => void;
}

export interface FolderSettingsState {
    name: string;
    color: number;
}

interface PatchedFolderSettingsState extends FolderSettingsState {
    iconType: IconType;
    icon?: string;
    always?: boolean;
}

export interface FolderSettingsClass {
    new (props: FolderSettingsProps, context?: any): FolderSettings;
}

export interface FolderSettings extends React.Component<FolderSettingsProps, PatchedFolderSettingsState> {
    close(): void;
    handleColorChange(color: number): void;
    handleNameChange(name: string): void;
    handleSubmit(event: SubmitEvent): void;
}

export const mountFolderSettingsPatch = ({
    context,
}: PatchDataWithResult<FolderSettings["componentDidMount"], FolderSettings>): void => {
    const {
        props: { folderId },
        state,
    } = context;

    if (state.iconType) {
        Logger.warn("FolderSettings already patched in mount");
        return;
    }

    // patch submit
    const original = context.handleSubmit;
    context.handleSubmit = (...args: Parameters<FolderSettings["handleSubmit"]>) => {
        const result = original(...args);

        // update folder if necessary
        const { folders } = Settings.current;
        if (state.iconType === IconType.Custom && state.icon) {
            folders[folderId] = { icon: state.icon, always: state.always };
            Settings.update({ folders });
        } else if ((state.iconType === IconType.Default || !state.icon) && folders[folderId]) {
            delete folders[folderId];
            Settings.update({ folders });
        }

        return result;
    };

    // add custom state
    const { icon = null, always = false } = Settings.current.folders[folderId] ?? {};
    context.setState({
        iconType: icon ? IconType.Custom : IconType.Default,
        icon,
        always,
    });
};

export const renderFolderSettingsPatch = ({
    context,
    result,
}: PatchDataWithResult<FolderSettings["render"], FolderSettings>): void => {
    const {
        props: { folderId },
        state,
    } = context;

    const [parent] = Utils.queryTreeForParent(result, (node) => node?.type === TextInput);
    if (!parent) {
        Logger.warn("Unable to find text input parent");
        return;
    }

    // inject our elements
    const { children } = parent.props;
    children.push(
        <FormItem title="Icon">
            <RadioGroup
                value={state.iconType}
                options={[
                    { value: IconType.Default, name: "Default Icon" },
                    { value: IconType.Custom, name: "Custom Icon" },
                ]}
                onChange={({ value }) => context.setState({ iconType: value })}
            />
        </FormItem>,
    );

    if (state.iconType === IconType.Custom) {
        const tree = SortedGuildStore.getGuildsTree();
        children.push(
            <FormItem title="Custom Icon">
                <BetterFolderUploader
                    icon={state.icon}
                    always={state.always}
                    folderNode={tree.nodes[folderId] as GuildsTreeFolder}
                    onChange={({ icon, always }) => context.setState({ icon, always })}
                />
            </FormItem>,
        );
    }
};
