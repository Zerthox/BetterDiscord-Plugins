import {createPlugin, React, Finder, Flux, Utils} from "discordium";
import config from "./config.json";
import styles from "./styles.scss";

const SettingsStore = Finder.byProps("getLocalVolume");
const ControlItem = Finder.raw.byName("MenuControlItem")?.exports;

interface VolumeInputProps {
    value: number;
    min?: number;
    max?: number;
    onChange(value: number): void;
}

const VolumeInput = ({value, min = 0, max = 999999, onChange}: VolumeInputProps): JSX.Element => (
    <div className="container-BetterVolume">
        <input
            type="number"
            min={min}
            max={max}
            value={Math.round((value + Number.EPSILON) * 100) / 100}
            onChange={({target}) => onChange(Math.min(Math.max(parseFloat(target.value), min), max))}
            className="input-BetterVolume"
        />
        <span>%</span>
    </div>
);

interface VolumeInputMappings {
    control: {
        props: {
            value: number;
            onChange(value: number): void;
        }
    }
}

const ConnectedVolumeInput = Flux.connectStores(
    [SettingsStore],
    ({control: {props: {value, onChange}}}: VolumeInputMappings) => ({value, onChange})
)(VolumeInput);

export default createPlugin({...config, styles}, ({Logger, Patcher}) => ({
    start() {
        Patcher.after(ControlItem, "default", ({args: [props], result}) => {
            if (props.id === "user-volume") {
                const slider = Utils.queryTree(result, (node) => node?.props?.maxValue === 200);
                if (!slider) {
                    Logger.error("Unable to find slider");
                    return;
                }

                const {props} = result;
                props.children = [props.children].flat();
                props.children.push(<ConnectedVolumeInput control={slider}/>);

                return result;
            }
        });
    },
    stop() {}
}));
