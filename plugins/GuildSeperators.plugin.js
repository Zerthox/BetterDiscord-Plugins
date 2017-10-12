//META{"name":"GuildSeperators"}*//

class GuildSeperators {
	getName() {
		return "Guild Seperators";
	}
	getDescription() {
		return "Add Guild Seperators with a button in the context menu.";
	}
	getVersion() {
		return "1.6";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	start() {
		BdApi.injectCSS("GuildSeperators", this.css());
		this.guilds = bdPluginStorage.get(this.getName(), "guilds");
		if (this.guilds === null) {
			this.guilds = [];
		}
		this.loadGuilds();
		if ($(".context-menu").length > 0) {
			this.insert();
		}
		console.log("[GuildSeperators] Started");
	}
	stop() {
		BdApi.clearCSS("GuildSeperators");
		this.saveGuilds();
		$(".guild[seperator]").removeAttr("seperator");
		console.log("[GuildSeperators] Stopped");
	}
	observer(e) {
		if ($(e.addedNodes).is(".context-menu") || $(e.addedNodes).find(".context-menu").length > 0) {
			this.insert();
		}
		if ($(e.removedNodes).is(".guild") || $(e.removedNodes).find(".guild").length > 0) {
			this.loadGuilds();
		}
	}
	insert() {
		var c = $(".context-menu"),
			g = this.menuParent(c[0]).parents(".guild");
		if (g.length > 0 && c.find(".item .add-seperator").length === 0) {
			var self = this,
				html = '<div class="item-group"><div class="item item-toggle"><span class="add-seperator">Add Seperator</span>';
				html += '<div class="checkbox"><div class="checkbox-inner"><input type="checkbox" value="on"><span></span></div><span></span></div>';
				html += '</div></div>';
			c.append(html).promise().done(function() {
				var i = $(".add-seperator").parents(".item");
				i.click(function() {
					if (g[0].hasAttribute("seperator")) {
						g.removeAttr("seperator");
						$(this).find("input").prop("checked", false);
					}
					else {
						g.attr("seperator", "");
						$(this).find("input").prop("checked", true);
					}
					self.saveGuilds();
				});
				if (g[0].hasAttribute("seperator")) {
					i.find("input").prop("checked", true);
				}
				var p = c[0].getBoundingClientRect();
				if (p.bottom > window.innerHeight) {
					c.css({top: p.top - c.height()});
					c.addClass("invertY");
				}
			});
		}
	}
	menuParent(e) {
		var r = e.getBoundingClientRect();
		if ($(e).hasClass("invertX")) {
			var x = r.right;
		}
		else {
			var x = r.left;
		}
		if ($(e).hasClass("invertY")) {
			var y = r.bottom;
		}
		else {
			var y = r.top;
		}
		return $(document.elementFromPoint(x, y));
	}
	saveGuilds() {
		var a = [];
		$(".guild[seperator]").each(function() {
			a.push($(this).find("a").attr("href").split("/")[2]);
		});
		this.guilds = a;
		bdPluginStorage.set(this.getName(), "guilds", this.guilds);
	}
	loadGuilds() {
		for (var i = 0; i < this.guilds.length; i++) {
			$(".guilds a[href*='" + this.guilds[i] + "']").parents(".guild").attr("seperator", "");
		}
	}
	css() {
		var r = `/* Guild Seperators CSS */
		.guild[seperator] {
			margin-bottom: 32px
		}
		.guild[seperator]::after {
			content: "";
			position: absolute;
			bottom: -16px;
			left: 20%;
			right: 20%;
			height: 2px;
			background: #2f3136;
		}`;
		return r;
	}
	onMessage() {}
	onSwitch() {}
	load() {}
	unload() {}
}
