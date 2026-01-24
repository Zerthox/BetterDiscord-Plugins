import { React } from "dium";
import { FormItem, FormSwitch, FormText, FormTextTypes, TextInput, margins } from "@dium/components";
import { Settings, DAYS_TO_MILLIS, cleanupOldEntries } from "./settings";

export function SettingsPanel(): React.JSX.Element {
    const [{ hideByDefault, saveStates, saveDuration }, setSettings] = Settings.useState();

    const [{ text, valid }, setDurationState] = React.useState({
        text: (saveDuration / DAYS_TO_MILLIS).toString(),
        valid: true,
    });

    return (
        <>
            <div className={margins.marginBottom20}>
                <FormSwitch
                    description="Collapse all embeds &amp; attachments initially."
                    checked={hideByDefault}
                    label="Collapse by default"
                    onChange={(checked) => setSettings({ hideByDefault: checked })}
                />
            </div>
            <div className={margins.marginBottom20}>
                <FormSwitch
                    description="Persist individual embed & attachment states between restarts."
                    checked={saveStates}
                    label="Save collapsed states"
                    onChange={(checked) => setSettings({ saveStates: checked })}
                />
            </div>
            <FormItem
                title="Save duration in days"
                disabled={!saveStates}
                error={!valid ? "Duration must be a positive number of days" : null}
            >
                <TextInput
                    type="number"
                    min={0}
                    disabled={!saveStates}
                    value={text}
                    onChange={(text) => {
                        const duration = Number.parseFloat(text) * DAYS_TO_MILLIS;
                        const valid = !Number.isNaN(duration) && duration >= 0;
                        if (valid) {
                            setSettings({ saveDuration: duration });
                            cleanupOldEntries();
                        }
                        setDurationState({ text, valid });
                    }}
                />
                <FormText type={FormTextTypes.DESCRIPTION} disabled={!saveStates}>
                    How long to keep embed & attachment states after not seeing them.
                </FormText>
            </FormItem>
        </>
    );
}
