/**
 * @name OnlineFriendCount
 * @author Zerthox
 * @version 1.2.0
 * @description Add the old online friend count back to guild list. Because nostalgia.
 * @source https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/OnlineFriendCount.plugin.js
 */

/*@cc_on
	@if (@_jscript)
		var name = WScript.ScriptName.split(".")[0];
		var shell = WScript.CreateObject("WScript.Shell");
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		shell.Popup("Do NOT run random scripts from the internet with the Windows Script Host!\n\nYou are supposed to move this file to your BandagedBD/BetterDiscord plugins folder.", 0, name + ": Warning!", 0x1030);
		var pluginsPath = shell.expandEnvironmentStrings("%appdata%\\BetterDiscord\\plugins");
		if (!fso.FolderExists(pluginsPath)) {
			if (shell.Popup("Unable to find the BetterDiscord plugins folder on your computer.\nOpen the download page of BandagedBD/BetterDiscord?", 0, name + ": BetterDiscord installation not found", 0x14) === 6) {
				shell.Exec("explorer \"https://github.com/rauenzi/betterdiscordapp/releases\"");
			}
		}
		else if (WScript.ScriptFullName === pluginsPath + "\\" + WScript.ScriptName) {
			shell.Popup("This plugin is already in the correct folder.\nNavigate to the \"Plugins\" settings tab in Discord and enable it there.", 0, name, 0x40);
		}
		else {
			shell.Exec("explorer " + pluginsPath);
		}
		WScript.Quit();
	@else
@*/

const {React, ReactDOM} = BdApi,
	Flux = BdApi.findModuleByProps("connectStores");
const Patches = [];

function qReact(node, query) {
	let match = false;

	try {
		match = query(node);
	} catch (err) {
		console.debug("Suppressed error in qReact query:\n", err);
	}

	if (match) {
		return node;
	} else if (node && node.props && node.props.children) {
		for (const child of [node.props.children].flat()) {
			const result = arguments.callee(child, query);

			if (result) {
				return result;
			}
		}
	}

	return null;
}

const Module = {
	Status: BdApi.findModuleByProps("getStatus", "getOnlineFriendCount")
};
const Component = {
	Guilds: BdApi.findModuleByDisplayName("Guilds"),
	Link: BdApi.findModuleByProps("NavLink").Link
};
const Selector = {
	guildsWrapper: BdApi.findModuleByProps("wrapper", "unreadMentionsBar"),
	guilds: BdApi.findModuleByProps("listItem", "friendsOnline")
};

class OnlineCount extends React.Component {
	render() {
		return React.createElement(
			"div",
			{
				className: Selector.guilds.listItem
			},
			React.createElement(
				Component.Link,
				{
					to: {
						pathname: "/channels/@me"
					}
				},
				React.createElement(
					"div",
					{
						className: Selector.guilds.friendsOnline,
						style: {
							margin: 0,
							cursor: "pointer"
						}
					},
					this.props.online,
					" Online"
				)
			)
		);
	}
}

const OnlineCountContainer = Flux.connectStores([Module.Status], () => ({
	online: Module.Status.getOnlineFriendCount()
}))(OnlineCount);

class Plugin {
	start() {
		this.createPatch(Component.Guilds.prototype, "render", {
			after: (d) => {
				const r = d.returnValue;
				const c = qReact(r, (e) => e.type.displayName === "VerticalScroller").props.children;

				if (!qReact(c, (e) => e.props.children.props.className === Selector.guilds.friendsOnline)) {
					c.splice(
						c.indexOf(c.find((e) => e.type && e.type.displayName === "FluxContainer(UnreadDMs)")),
						0,
						React.createElement(OnlineCountContainer, null)
					);
				}

				return r;
			}
		});
		this.forceUpdate(`.${Selector.guildsWrapper.wrapper}`);
	}

	stop() {
		this.forceUpdate(`.${Selector.guildsWrapper.wrapper}`);
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "OnlineFriendCount";
	}

	getVersion() {
		return "1.2.0";
	}

	getAuthor() {
		return "Zerthox";
	}

	getDescription() {
		return "Add the old online friend count back to guild list. Because nostalgia.";
	}

	log(msg, log = console.log) {
		log(
			`%c[${this.getName()}] %c(v${this.getVersion()})%c ${msg}`,
			"color: #3a71c1; font-weight: 700;",
			"color: #666; font-size: .8em;",
			""
		);
	}

	start() {
		super.start();
		this.log("Enabled");
	}

	stop() {
		while (Patches.length > 0) {
			Patches.pop()();
		}

		this.log("Unpatched all");

		if (document.getElementById(this.getName())) {
			BdApi.clearCSS(this.getName(), css);
		}

		super.stop();

		if (this.settingsRoot) {
			ReactDOM.unmountComponentAtNode(this.settingsRoot);
			delete this.settingsRoot;
		}

		this.log("Disabled");
	}

	saveData(id, value) {
		return BdApi.saveData(this.getName(), id, value);
	}

	loadData(id, fallback = null) {
		const l = BdApi.loadData(this.getName(), id);
		return l ? l : fallback;
	}

	injectCSS(css) {
		const el = document.getElementById(this.getName());

		if (!el) {
			BdApi.injectCSS(this.getName(), css);
		} else {
			el.innerHTML += "\n\n/* --- */\n\n" + css;
		}
	}

	createPatch(target, method, options) {
		options.silent = true;
		Patches.push(BdApi.monkeyPatch(target, method, options));
		this.log(
			`Patched ${method} of ${target.displayName ||
				target.name ||
				target.constructor.displayName ||
				target.constructor.name ||
				"Unknown"} ${target instanceof React.Component ? "component" : "module"}`
		);
	}

	async forceUpdate(...selectors) {
		for (const sel of selectors) {
			try {
				for (const el of document.querySelectorAll(sel)) {
					let fiber = BdApi.getInternalInstance(el);

					if (fiber) {
						while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
							fiber = fiber.return;
						}

						fiber.stateNode.forceUpdate();
					}
				}
			} catch (e) {
				this.log(`Failed to force update "${sel}" nodes`, console.warn);
				console.error(e);
			}
		}
	}
};

if (Plugin.prototype.getSettings) {
	module.exports.prototype.getSettingsPanel = function() {
		if (!this.settingsRoot) {
			this.settingsRoot = document.createElement("div");
			this.settingsRoot.className = `settingsRoot-${this.getName()}`;
			ReactDOM.render(this.getSettings(), this.settingsRoot);
		}

		return this.settingsRoot;
	};
}

/*@end@*/
