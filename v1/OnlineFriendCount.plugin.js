/**
 * @name OnlineFriendCount
 * @author Zerthox
 * @version 1.2.1
 * @description Add the old online friend count back to guild list. Because nostalgia.
 * @source https://github.com/Zerthox/BetterDiscord-Plugins
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
			after: (data) => {
				const result = data.returnValue;
				const scroller = qReact(result, (e) => e.type.displayName === "VerticalScroller");

				if (!qReact(scroller, (e) => e.props.className === Selector.guilds.friendsOnline)) {
					const children = scroller.props.children;
					children.splice(
						children.indexOf(qReact(scroller, (e) => e.type.displayName === "FluxContainer(UnreadDMs)")),
						0,
						React.createElement(OnlineCountContainer, null)
					);
				}

				return result;
			}
		});
		this.forceUpdate(Selector.guildsWrapper.wrapper);
	}

	stop() {
		this.forceUpdate(Selector.guildsWrapper.wrapper);
	}
}

module.exports = class Wrapper extends Plugin {
	getName() {
		return "OnlineFriendCount";
	}

	getVersion() {
		return "1.2.1";
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
		this._Patches = [];
		super.start();
		this.log("Enabled");
	}

	stop() {
		while (this._Patches.length > 0) {
			this._Patches.pop()();
		}

		this.log("Unpatched all");

		if (document.getElementById(this.getName())) {
			BdApi.clearCSS(this.getName());
		}

		super.stop();

		if (this._settingsRoot) {
			ReactDOM.unmountComponentAtNode(this._settingsRoot);
			delete this._settingsRoot;
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

		this._Patches.push(BdApi.monkeyPatch(target, method, options));

		this.log(
			`Patched ${method} of ${options.name ||
				target.displayName ||
				target.name ||
				target.constructor.displayName ||
				target.constructor.name ||
				"Unknown"} ${
				options.type === "component" || target instanceof React.Component ? "component" : "module"
			}`
		);
	}

	async forceUpdate(...classes) {
		this.forceUpdateElements(
			...classes.map((e) => document.getElementsByClassName(e)).reduce((p, e) => p.append(e))
		);
	}

	async forceUpdateElements(...elements) {
		for (const el of elements) {
			try {
				let fiber = BdApi.getInternalInstance(el);

				if (fiber) {
					while (!fiber.stateNode || !fiber.stateNode.forceUpdate) {
						fiber = fiber.return;
					}

					fiber.stateNode.forceUpdate();
				}
			} catch (e) {
				this.log(
					`Failed to force update "${
						el.id ? `#${el.id}` : el.className ? `.${el.className}` : el.tagName
					}" state node`,
					console.warn
				);
				console.error(e);
			}
		}
	}
};

if (Plugin.prototype.getSettings) {
	module.exports.prototype.getSettingsPanel = function() {
		const self = this;

		class SettingsBase extends React.Component {
			constructor(props) {
				super(props);
				this.state = self.settings;
			}

			componentDidUpdate(prevProps, prevState, snapshot) {
				self.saveData("settings", Object.assign(self.settings, this.state));
			}
		}

		if (!this._settingsRoot) {
			this._settingsRoot = document.createElement("div");
			this._settingsRoot.className = `settingsRoot-${this.getName()}`;
			ReactDOM.render(this.getSettings(SettingsBase), this._settingsRoot);
		}

		return this._settingsRoot;
	};
}

/*@end@*/
