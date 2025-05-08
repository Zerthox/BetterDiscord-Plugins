import {React} from "dium";
import {FormItem, FormSwitch, FormText, FormTextTypes, TextInput} from "@dium/components";
import {Settings, DAYS_TO_MILLIS, cleanupOldEntries} from "./settings";

export function SettingsPanel(): React.JSX.Element {
    const [{hideByDefault, saveStates, saveDuration}, setSettings] = Settings.useState();

    const [{text, valid}, setDurationState] = React.useState({
        text: (saveDuration / DAYS_TO_MILLIS).toString(),
        valid: true
    });

    return (
        <>
            <FormSwitch
                note="Collapse all embeds &amp; attachments initially."
                hideBorder
                value={hideByDefault}
                onChange={(checked) => setSettings({hideByDefault: checked})}
            >Collapse by default</FormSwitch>
            <FormSwitch
                note="Persist individual embed & attachment states between restarts."
                hideBorder
                value={saveStates}
                onChange={(checked) => setSettings({saveStates: checked})}
            >Save collapsed states</FormSwitch>
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
                            setSettings({saveDuration: duration});
                            cleanupOldEntries();
                        }
                        setDurationState({text, valid});
                    }}
                />
                <FormText
                    type={FormTextTypes.DESCRIPTION}
                    disabled={!saveStates}
                >How long to keep embed & attachment states after not seeing them.</FormText>
            </FormItem>
        </>
    );
}
