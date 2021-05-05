/**
 * HypeSquadCheatsheet plugin
 * @author Zerthox
 */

/** Component storage */
const Component = {
    QuestionGroup: BdApi.findModuleByDisplayName("QuestionGroup")
};

// eslint-disable-next-line no-unused-vars
class Plugin {
    start() {
        this.createPatch(Component.QuestionGroup.prototype, "render", {after: ({returnValue}) => {
            const group = qReact(returnValue, (node) => node.type.displayName === "RadioGroup");
            for (const option of group.props.options) {
                option.tooltipText = (
                    option.value === "HOUSE_1" ? "Bravery" :
                        option.value === "HOUSE_2" ? "Brilliance" :
                            option.value === "HOUSE_3" ? "Balance" :
                                option.value === "RANDOM_HYPESQUAD_HOUSE" ? "Random" :
                                    "Unknown"
                );
                option.tooltipPosition = "left";
            }
        }});
    }

    stop() {}
}
