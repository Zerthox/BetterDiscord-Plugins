/**
 * OnlineFriendCount plugin
 * @author Zerthox
 */

/** Module storage */
const Module = {
    Constants: BdApi.findModuleByProps("Permissions", "RelationshipTypes"),
    Status: BdApi.findModuleByProps("getState", "getStatus", "isMobileOnline"),
    Relationships: BdApi.findModuleByProps("isFriend", "getRelationshipCount")
};

/** Component storage */
const Component = {
    HomeButton: BdApi.findModule((m) => m.default && m.default.toString().includes("showDMsOnly")),
    Link: BdApi.findModuleByProps("NavLink").Link
};

/** Selector storage */
const Selector = {
    guilds: BdApi.findModuleByProps("guilds", "base"),
    list: BdApi.findModuleByProps("listItem"),
    friendsOnline: "friendsOnline-2JkivW"
};

/** Plugin styles */
const Styles = $include("./styles.scss");

// OnlineCount component
function OnlineCount({online}) {
    return (
        <div className={Selector.list.listItem}>
            <Component.Link to={{pathname: "/channels/@me"}}>
                <div className={Selector.friendsOnline}>{online} Online</div>
            </Component.Link>
        </div>
    );
}

// Flux container for OnlineCount component
const OnlineCountContainer = Flux.connectStores(
    [Module.Status, Module.Relationships],
    () => {
        const {RelationshipTypes, StatusTypes} = Module.Constants;
        const relationships = Module.Relationships.getRelationships();
        const filtered = Object.entries(relationships)
            .filter(([id, type]) => type === RelationshipTypes.FRIEND && Module.Status.getStatus(id) !== StatusTypes.OFFLINE);
        return {online: filtered.length};
    }
)(OnlineCount);

// eslint-disable-next-line no-unused-vars
class Plugin {
    start() {
        // inject styles
        this.injectCSS(Styles);

        // patch into home button
        this.createPatch(Component.HomeButton, "default", {instead: ({methodArguments: [props], originalMethod}) => {
            return (
                <>
                    {originalMethod(props)}
                    <OnlineCountContainer/>
                </>
            );
        }});

        // force update
        this.triggerRerender();
    }

    stop() {
        this.triggerRerender();
    }

    findGuildsOwner() {
        // grab fiber
        const node = document.getElementsByClassName(Selector.guilds.guilds)[0];
        let fiber = BdApi.getInternalInstance(node);
        if (!fiber) {
            return null;
        }

        // walk up until state node found
        while (fiber) {
            if (fiber.stateNode instanceof React.Component) {
                return fiber;
            }
            fiber = fiber.return;
        }

        return null;
    }

    triggerRerender() {
        const fiber = this.findGuildsOwner();
        if (fiber) {
            fiber.stateNode.forceUpdate();
            this.log("Successfully triggered Guilds rerender");
        } else {
            this.warn("Unable to trigger Guilds rerender");
        }
    }
}
