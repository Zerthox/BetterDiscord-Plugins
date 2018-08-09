//META{"name":"GuildSeparators"}*//

class GuildSeparators {
	getName() {
		return "Guild Separators";
	}
	getDescription() {
		return "Add Guild Separators with a button in the context menu.";
	}
	getVersion() {
		return "1.9.2";
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
		if ($(e.removedNodes).is(".guild-1EfMGQ") || $(e.removedNodes).find(".guild-1EfMGQ").length > 0) {
			this.loadGuilds();
		}
	}
	insert() {
		var c = $(".contextMenu-HLZMGh"),
			g = $(this.menuParent(c[0])).parents(".guild-1EfMGQ");
		if (g.length > 0 && c.find(".add-separator").length === 0) {
			var self = this,
				html = '<div class="itemGroup-1tL0uz da-itemGroup"><div tabindex="0" class="item-1Yvehc itemToggle-S7XGOQ da-item da-itemToggle add-separator" role="button"><div class="label-JWQiNe da-label">Add Separator</div><div tabindex="0" class="checkbox da-checkbox" role="button"><div class="checkbox-inner da-checkboxInner"><input type="checkbox"><span></span></div><span></span></div></div></div>';
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
		$(".guild-1EfMGQ[separator]").each(function() {
			a.push($(this).find("a").attr("href").split("/")[2]);
		});
		this.guilds = a;
		bdPluginStorage.set(this.getName(), "guilds", this.guilds);
	}
	loadGuilds() {
		this.guilds = bdPluginStorage.get(this.getName(), "guilds");
		for (var i = 0; i < this.guilds.length; i++) {
			$(".guilds-1q_RqH a[href*='" + this.guilds[i] + "']").parents(".guild-1EfMGQ").attr("separator", "");
		}
	}
	css() {
		var r = `/* Guild Separators CSS */
		.guild-1EfMGQ[separator] {
			margin-bottom: 32px
		}
		.guild-1EfMGQ[separator]::after {
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