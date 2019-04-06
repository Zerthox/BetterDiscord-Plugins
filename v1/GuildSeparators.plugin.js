//META {"name": "GuildSeparators", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/v1/GuildSeparators.plugin.js"} *//

/**
 * Guild Separators plugin class
 * @author Zerthox
 * @version 2.1.1
 */
class GuildSeparators {

	/**
	 * @return {string} plugin name
	 */
	getName() {
		return "GuildSeparators";
	}

	/**
	 * @return {*} plugin description
	 */
	getDescription() {
		return BdApi.React.createElement("span", {style: {"white-space": "pre-line"}},
			"Add Guild Separators with a button in the context menu."
		);
	}

	/**
	 * @return {string} plugin version
	 */
	getVersion() {
		return "2.1.1";
	}

	/**
	 * @return {*} plugin author
	 */
	getAuthor() {
		return BdApi.React.createElement("a", {href: "https://github.com/Zerthox", target: "_blank"}, "Zerthox");
	}

	/**
	 * plugin class constructor
	 */
	constructor() {

		/**
		 * object with modules
		 */
		this.module = {
			contextMenu: BdApi.findModuleByProps("getContextMenu")
		}

		// find context menu class module
		var cm = BdApi.findModuleByProps("contextMenu", "item", "label");

		/**
		 * object with selectors
		 */
		this.selector = {
			guild: `.${BdApi.findModuleByProps("container", "guildIcon").container.split(" ")[0]}`,
			contextMenu: `.${cm.contextMenu.split(" ")[0]}`,
			contextMenuItem: `.${cm.item.split(" ")[0]}`,
			contextMenuLabel: `.${cm.label.split(" ")[0]}`
		};

		/**
		 * plugin styles
		 */
		this.css= `/* Guild Separators CSS */
			${this.selector.guild}[separator] {
				margin-bottom: 32px
			}
			${this.selector.guild}[separator]:after {
				content: "";
				position: absolute;
				bottom: -16px;
				left: 20%;
				right: 20%;
				height: 2px;
				background: #2f3136;
			}`;
	}

	/**
	 * plugin start function
	 */
	start() {

		// inject styles
		BdApi.injectCSS(this.getName(), this.css);

		// load guilds array from storage
		this.guilds = BdApi.loadData(this.getName(), "guilds");

		// check if loaded guilds array is empty
		if (typeof this.guilds === "undefined") {

			// reset guilds array
			this.guilds = [];

			// save empty guilds array
			BdApi.saveData(this.getName(), "guilds", this.guilds);
		}

		// process guilds
		this.processGuilds();

		// check if context menu is present
		var m = document.querySelector(`${this.selector.contextMenu}`);
		if (m != null) {

			// insert into context menu
			this.insertContextMenu(m);
		}

		// console output
		console.log(`[${this.getName()}] Enabled`);
	}

	/**
	 * plugin stop function
	 */
	stop() {

		// remove styles
		BdApi.clearCSS("GuildSeparators");

		// save guilds array
		BdApi.saveData(this.getName(), "guilds", this.guilds);

		// remove separators
		for (var e of document.querySelectorAll(`${this.selector.guild}[separator]`)) {
			e.removeAttribute("separator");
		}

		// console output
		console.log(`[${this.getName()}] Disabled`);
	}

	/**
	 * plugin DOM observer
	 * @param {*} e event
	 */
	observer(e) {

		// iterate over added nodes
		for (var n of e.addedNodes) {

			// check if node is html element
			if (n instanceof HTMLElement) {

				// check if contextMenu or guild were added
				if (n.matches(this.selector.contextMenu)) {

					// insert context menu
					this.insertContextMenu(n);
				}
				else if (n.matches(this.selector.guild) || n.querySelector(this.selector.guild) != null) {

					// process guilds
					this.processGuilds();
				}
			}
		}
	}

	/**
	 * insert guild separator option into passed context menu
	 * @param {HTMLElement} m context menu element
	 */
	insertContextMenu(m) {

		// get menu target
		var t = this.module.contextMenu.getContextMenu().target;

		// check if target is guild
		var g = t.parents(this.selector.guild);
		if (g.length > 0) {

			// get guild element
			g = g[0];

			// get guild id
			var id = this.getGuildId(g);

			// clone context menu item
			var i = m.querySelector("input[type=checkbox]").parents(this.selector.contextMenuItem)[0].cloneNode(true);

			// set context menu item text
			i.querySelector(this.selector.contextMenuLabel).innerHTML = "Add Separator";

			// find context menu item checkbox
			var c = i.querySelector("input[type=checkbox]");

			// set checkbox checked property
			c.checked = g.hasAttribute("separator");

			// set checkbox onclick
			i.onclick = () => {

				// check if guild has separator
				if (g.hasAttribute("separator")) {

					// remove separator attribute
					g.removeAttribute("separator");

					// uncheck checkbox
					c.checked = false;

					// remove guild id from guilds array
					this.guilds.splice(this.guilds.indexOf(id), 1);
				}
				else {

					// remove separator attribute
					g.setAttribute("separator", "");

					// check checkbox
					c.checked = true;

					// add guild id to guilds array
					this.guilds.push(id);
				}

				// save guilds array
				BdApi.saveData(this.getName(), "guilds", this.guilds);
			};

			// append context menu item
			m.appendChild(i);

			// update context menu position
			BdApi.getInternalInstance(m).return.memoizedProps.onHeightUpdate();
		}
	}

	/**
	 * process guilds
	 */
	processGuilds() {

		// iterate over guilds
		for (var g of document.querySelectorAll(this.selector.guild)) {

			// check if guilds array contains guild
			if (this.guilds.includes(this.getGuildId(g))) {

				// add separator attribute
				g.setAttribute("separator", "");
			}
		}
	}

	/**
	 * get guild id of passed guild element
	 * @param {HTMLElement} e guild element
	 * @return {string} guild id
	 */
	getGuildId(e) {
		var r = BdApi.getInternalInstance(e);
		return r && r.return.memoizedProps.guild.id;
	}

}