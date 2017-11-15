//META{"name":"LinkTooltips"}*//

class LinkTooltips {
	getName() {
		return "Link Tooltips";
	}
	getDescription() {
		return "Show tooltips with link URLs on hover.";
	}
	getVersion() {
		return "1.0";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	start() {
		this.insert();
		console.log("[LinkTooltips] Started");
	}
	get selector() {
		return ".message :not(.attachment-image) > a[href]:not(.embed-thumbnail:not(.embed-thumbnail-link))";
	}
	stop() {
		$(this.selector).each(function() {
			$(this).attr("title", $(this).attr("lt.save"));
			$(this).removeAttr("lt.save");
			$(this).off("mouseover.lt mouseout.lt");
		});
		console.log("[LinkTooltips] Stopped");
	}
	observer(e) {
		var a = $(e.addedNodes),
			r = $(e.removedNodes);
		if (a.is(".message") || a.find(".message").length > 0) {
			this.insert();
		}
		if (r.is(this.selector) || r.find(this.selector).length > 0) {
			$(".tooltip").remove();
		}
	}
	insert() {
		var m = $(this.selector);
		if (m.length > 0) {
			var self = this;
			m.each(function() {
				$(this).attr("lt.save", $(this).attr("title"));
				$(this).removeAttr("title");
				$(this).on("mouseover.lt", function(e) {
					if ($(".tooltip").length === 0) {
						self.createTooltip($(this).attr("href"));
					}
				});
				$(this).on("mouseout.lt", function(e) {
					$(".tooltip").remove();
				});
			});
		}
	}
	createTooltip(t) {
		var html = '<div class="tooltip tooltip-top tooltip-black" style="max-width: 300px;">' + t + '</div>';
		$(".tooltips").append(html);
		var e = $(".tooltip"),
			p = $(":hover").last();
		e.css("top", p.offset().top - e.outerHeight());
		e.css("left", p.offset().left + (p.outerWidth() - e.outerWidth()) / 2);
	}
	unload() {}
	onMessage() {}
	onSwitch() {}
	load() {}
}