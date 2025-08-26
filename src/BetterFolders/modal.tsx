import { React, Logger, PatchDataWithResult, Utils } from "dium";
import { SortedGuildStore, GuildsTreeFolder } from "@dium/modules";
import { RadioGroup, FormItem } from "@dium/components";
import { BetterFolderUploader } from "./uploader";
import { Settings } from "./settings";

export interface FolderSettingsModalProps {
    folderId: number;
    folderName: string;
    folderColor: number;
    onClose: () => void;
    transitionState: number;
}

export interface FolderSettingsModalState {
    name: string;
    color: number;
}

export type FolderSettingsModal = typeof React.Component<FolderSettingsModalProps, FolderSettingsModalState>;

const enum IconType {
    Default = "default",
    Custom = "custom",
}

interface PatchedFolderSettingsModalState extends FolderSettingsModalState {
    iconType: IconType;
    icon?: string;
    always?: boolean;
}

type PatchedModal = React.Component<FolderSettingsModalProps, PatchedFolderSettingsModalState>;

export const folderModalPatch = ({
    context,
    result,
}: PatchDataWithResult<PatchedModal["render"], PatchedModal>): void => {
    const { folderId } = context.props;
    const { state } = context;

    // find form
    const form = Utils.queryTree(result, (node) => node?.type === "form");
    if (!form) {
        Logger.warn("Unable to find form");
        return;
    }

    // add custom state
    if (!state.iconType) {
        const { icon = null, always = false } = Settings.current.folders[folderId] ?? {};
        Object.assign(state, {
            iconType: icon ? IconType.Custom : IconType.Default,
            icon,
            always,
        });
    }

    // render icon select
    const { children } = form.props;
    const { className } = children[0].props;
    children.push(
        <FormItem title="Icon" className={className}>
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
        // render custom icon options
        const tree = SortedGuildStore.getGuildsTree();
        children.push(
            <FormItem title="Custom Icon" className={className}>
                <BetterFolderUploader
                    icon={state.icon}
                    always={state.always}
                    folderNode={tree.nodes[folderId] as GuildsTreeFolder}
                    onChange={({ icon, always }) => context.setState({ icon, always })}
                />
            </FormItem>,
        );
    }

    // override submit onclick
    const button = Utils.queryTree(result, (node) => node?.props?.type === "submit");
    const original = button.props.onClick;
    button.props.onClick = (...args: any[]) => {
        original(...args);

        // update folders if necessary
        const { folders } = Settings.current;
        if (state.iconType === IconType.Custom && state.icon) {
            folders[folderId] = { icon: state.icon, always: state.always };
            Settings.update({ folders });
        } else if ((state.iconType === IconType.Default || !state.icon) && folders[folderId]) {
            delete folders[folderId];
            Settings.update({ folders });
        }
    };
};
