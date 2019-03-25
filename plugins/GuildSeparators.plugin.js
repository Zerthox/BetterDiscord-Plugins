//META {"name": "GuildSeparators", "source": "https://github.com/Zerthox/BetterDiscord-Plugins/blob/master/plugins/GuildSeparators.plugin.js"} *//

/**
 * Guild Separators plugin class
 * @author Zerthox
 * @version 2.0.2
 */
class GuildSeparators {

	/**
	 * @return {string} plugin name
	 */
	getName() {
		return "GuildSeparators";
	}

	/**
	 * @return {*[]} plugin description
	 */
	getDescription() {
		return BDV2.react.createElement("span", {style: {"white-space": "pre-line"}},
			"Add Guild Separators with a button in the context menu.\n Using getInternalInstance by ",
			BDV2.react.createElement("a", {href: "https://github.com/noodlebox", target: "_blank"}, "@noodlebox#0155"),
			"."
		);
	}

	/**
	 * @return {string} plugin version
	 */
	getVersion() {
		return "2.0.2";
	}

	/**
	 * @return {*} plugin author
	 */
	getAuthor() {
		return BDV2.react.createElement("a", {href: "https://github.com/Zerthox", target: "_blank"}, "Zerthox");
	}

	/**
	 * plugin class constructor
	 */
	constructor() {

		/**
		 * object with selectors
		 */
		this.selectors = {
			guild: ".container-2td-dC",
			contextMenu: ".contextMenu-HLZMGh",
			contextMenuItem: ".item-1Yvehc",
			contextMenuLabel: ".label-JWQiNe"
		};

		/**
		 * plugin styles
		 */
		this.css= `/* Guild Separators CSS */
			${this.selectors.guild}[separator] {
				margin-bottom: 32px
			}
			${this.selectors.guild}[separator]:after,
			${this.selectors.guild}[separator]::after {
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
		var m = document.querySelector(`${this.selectors.contextMenu}`);
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
		for (var e of document.querySelectorAll(`${this.selectors.guild}[separator]`)) {
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
                if (n.matches(this.selectors.contextMenu)) {

                    // insert context menu
                    this.insertContextMenu(n);
                }
                else if (n.matches(this.selectors.guild) || n.find(this.selectors.guild) != null) {

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
		var t = this.getMenuTarget(m);

		// break function execution if target not found
		if (typeof t === "undefined") {
			return;
		}

		// check if target is guild
		var g = t.parents(this.selectors.guild);
		if (g.length > 0) {

			// get guild element
			g = g[0];

			// get guild id
			var id = this.getGuildId(g);

			// clone context menu item
			var i = m.find("input[type=checkbox]").parents(this.selectors.contextMenuItem)[0].cloneNode(true);

			// set context menu item text
			i.find(this.selectors.contextMenuLabel).innerHTML = "Add Separator";

			// find context menu item checkbox
			var c = i.find("input[type=checkbox]");

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
			this.getInternalInstance(m).return.memoizedProps.onHeightUpdate();
		}
	}

	/**
	 * process guilds
	 */
	processGuilds() {

		// iterate over guilds
		for (var g of document.querySelectorAll(this.selectors.guild)) {

			// check if guilds array contains guild
			if (this.guilds.includes(this.getGuildId(g))) {

				// add separator attribute
				g.setAttribute("separator", "");
			}
		}
	}

	/**
	 * get target element of passed context menu element
	 * @param {HTMLElement} e context menu element
	 * @return {HTMLElement} target element
	 */
	getMenuTarget(e) {
		var r = this.getInternalInstance(e);
		return r && r.return.memoizedProps.target;
	}

	/**
	 * get guild id of passed guild element
	 * @param {HTMLElement} e guild element
	 * @return {string} guild id
	 */
	getGuildId(e) {
		var r = this.getInternalInstance(e);
		return r && r.return.memoizedProps.guild.id;
	}

	/**
     * getInternalInstance by @noodlebox
	 * @author noodlebox
	 * @param {HTMLElement} e element
	 * @return {*} react internal instance of passed element
     */
    getInternalInstance(e) {
        return e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
	}

}