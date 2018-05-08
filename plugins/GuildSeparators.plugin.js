//META{"name":"GuildSeparators"}*//

class GuildSeparators {
	getName() {
		return "Guild Separators";
	}
	getDescription() {
		return "Add Guild Separators with a button in the context menu.";
	}
	getVersion() {
		return "1.9";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	start() {
		BdApi.injectCSS("GuildSeparators", this.css());
		this.guilds = bdPluginStorage.get(this.getName(), "guilds");
		if (this.guilds === null) {
			this.guilds = [];
			this.saveGuilds();
		}
		this.loadGuilds();
		if ($(".context-menu").length > 0) {
			this.insert();
		}
		console.log("[GuildSeparators] Started");
	}
	stop() {
		BdApi.clearCSS("GuildSeparators");
		this.saveGuilds();
		$(".guild[separator]").removeAttr("separator");
		console.log("[GuildSeparators] Stopped");
	}
	observer(e) {
		if ($(e.addedNodes).is(".contextMenu-HLZMGh") || $(e.addedNodes).find(".contextMenu-HLZMGh").length > 0) {
			this.insert();
		}
		if ($(e.removedNodes).is(".guild") || $(e.removedNodes).find(".guild").length > 0) {
			this.loadGuilds();
		}
	}
	insert() {
		var c = $(".contextMenu-HLZMGh"),
			g = $(this.menuParent(c[0])).parents(".guild");
		if (g.length > 0 && c.find(".item-1Yvehc .add-separator").length === 0) {
			var self = this,
				html = '<div class="itemGroup-1tL0uz"><div class="item-1Yvehc itemToggle-S7XGOQ add-separator"><div class="label-JWQiNe">Add Separator</div><div class="checkbox"><div class="checkbox-inner"><input type="checkbox"><span></span></div><span></span></div></div></div></div>';
			c.append(html).promise().done(function() {
				var t = parseInt(c.css("top"));
				if (c.hasClass("undefined")) {
					c.css("top", t - 31);
				}
				else if (t + c.height() > window.innerHeight) {
					c.css("top", t - c.height());
					c.addClass("undefined");
				}
				var i = $(".add-separator");
				i.click(function() {
					if (g[0].hasAttribute("separator")) {
						g.removeAttr("separator");
						$(this).find("input").prop("checked", false);
					}
					else {
						g.attr("separator", "");
						$(this).find("input").prop("checked", true);
					}
					self.saveGuilds();
				});
				if (g[0].hasAttribute("separator")) {
					i.find("input").prop("checked", true);
				}
			});
		}
	}
	menuParent(e) {
		return e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))].return.memoizedProps.target;
	}
	saveGuilds() {
		var a = [];
		$(".guild[separator]").each(function() {
			a.push($(this).find("a").attr("href").split("/")[2]);
		});
		this.guilds = a;
		bdPluginStorage.set(this.getName(), "guilds", this.guilds);
	}
	loadGuilds() {
		this.guilds = bdPluginStorage.get(this.getName(), "guilds");
		for (var i = 0; i < this.guilds.length; i++) {
			$(".guilds a[href*='" + this.guilds[i] + "']").parents(".guild").attr("separator", "");
		}
	}
	css() {
		var r = `/* Guild Separators CSS */
		.guild[separator] {
			margin-bottom: 32px
		}
		.guild[separator]::after {
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