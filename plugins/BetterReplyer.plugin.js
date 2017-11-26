//META{"name":"BetterReplyer"}*//

class BetterReplyer {
	getName() {
		return "BetterReplyer";
	}
	getDescription() {
		return "Reply to people using their ID with a button. Inspired by Replyer by @Hammock#3110, @Natsulus#0001 & @Zerebos#7790. Using getInternalInstance by @noodlebox#0155.";
	}
	getVersion() {
		return "2.2.3";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	start() {
		BdApi.injectCSS(this.getName(), this.css);
		this.insert();
		console.log("[BetterReplyer] Started");
	}
	stop() {
		$(".message-group .replyer").remove();
		BdApi.clearCSS(this.getName());
		console.log("[BetterReplyer] Stopped");
	}
	observer(e) {
		var a = $(e.addedNodes),
			r = $(e.removedNodes);
		if (a.is(".message") || a.find(".message").length > 0 || r.is(".replyer") || r.find(".replyer").length > 0) {
			this.insert();
		}
	}
	insert() {
		var self = this;
		$(".messages .message-group").each(function() {
			if ($(this).find(".replyer").length === 0) {
				$(this).find(".timestamp").after("<span class='replyer'>Reply</span>");
				$(this).find(".replyer").click(function() {
					var id = self.messageAuthor($(this).parents(".message-group")[0]).id;
					$(".content [class*='channelTextArea-'] textarea").each(function() {
						var mention = "<@!" + id + "> ";
						this.focus();
						var start = this.selectionStart + mention.length,
							end = this.selectionEnd + mention.length;
						this.selectionStart = this.selectionEnd = 0;
						document.execCommand("insertText", false, mention);
						this.selectionStart = start;
						this.selectionEnd = end;
					});
				});
			}
		});
	}
	reactInternalInstance(e) {
		// getInternalInstance by @noodlebox#0155
		return e[Object.keys(e).find(k => k.startsWith("__reactInternalInstance"))];
	}
	messageAuthor(message) {
		return this.reactInternalInstance(message).child.child.memoizedProps.user;
	}
	get css() {
		var r = `.replyer {
			position: relative;
			top: -1px;
			margin-left: 5px;
			padding: 3px 5px;
			background: rgba(0, 0, 0, 0.4);
			border-radius: 3px;
			color: #fff !important;
			font-size: 10px;
			text-transform: uppercase;
			cursor: pointer;
		}
		.message-group:not(:hover) .replyer {
			visibility: hidden;
		}`;
		return r;
	}
	unload() {
		this.stop();
	}
	onMessage() {}
	onSwitch() {}
	load() {}
}