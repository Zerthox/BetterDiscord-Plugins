import {createPlugin, Finder, Filters, Patcher, React} from "dium";
import {Snowflake, MediaEngineStore, MediaEngineContext, AudioConvert, MediaEngineActions} from "@dium/modules";
import {Settings} from "./settings";
import {css} from "./styles.module.scss";
import {MenuItem} from "@dium/components";
import {NumberInput} from "./input";
import {handleVolumeSync, resetVolumeSync} from "./sync";

type UseUserVolumeItem = (userId: Snowflake, context: MediaEngineContext) => JSX.Element;

const useUserVolumeItemFilter = Filters.bySource("user-volume");

export default createPlugin({
    start() {
        // handle volume override sync
        handleVolumeSync();

        // add number input to user volume item
        Finder.waitFor(useUserVolumeItemFilter, {resolve: false}).then((result: Record<string, UseUserVolumeItem>) => {
            const useUserVolumeItem = Finder.resolveKey(result, useUserVolumeItemFilter);
            Patcher.after(...useUserVolumeItem, ({args: [userId, context], result}) => {
                // check for original render
                if (result) {
                    // we can read this directly, the original has a hook to ensure updates
                    const volume = MediaEngineStore.getLocalVolume(userId, context);

                    return (
                        <>
                            {result}
                            <MenuItem
                                id="user-volume-input"
                                render={() => (
                                    <NumberInput
                                        value={AudioConvert.amplitudeToPerceptual(volume)}
                                        min={0}
                                        max={999999}
                                        fallback={100}
                                        onChange={(value) => MediaEngineActions.setLocalVolume(
                                            userId,
                                            AudioConvert.perceptualToAmplitude(value),
                                            context
                                        )}
                                    />
                                )}
                            />
                        </>
                    );
                }
            }, {name: "useUserVolumeItem"});
        });
    },
    stop() {
        resetVolumeSync();
    },
    styles: css,
    Settings
});
