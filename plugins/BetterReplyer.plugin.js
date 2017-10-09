//META{"name":"BetterReplyer"}*//

class BetterReplyer {
	getName() {
		return "BetterReplyer";
	}
	getDescription() {
		return "Reply to people using their ID with a button. Inspired by Replyer by @Hammock#3110, @Natsulus#0001 & @Zerebos#7790. Using getInternalInstance by @noodlebox#0155";
	}
	getVersion() {
		return "2.0";
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
	observer(e){
		if ($(e.addedNodes).is(".message") || $(e.addedNodes).find(".message").length > 0) {
			this.insert();
		}
	}
	insert() {
		var self = this;
		$(".chat .message-group").each(function() {
			if ($(this).find(".replyer").length === 0) {
				$(this).find(".timestamp").parent().append("<span class='replyer'>Reply</span>");
				$(this).find(".replyer").click(function() {
					var id = self.messageAuthor($(this).parents(".message-group")[0]).id;
					$(".content [class*='channelTextArea-'] textarea").each(function() {
						var input = "<@" + id + "> " + $(this).val();
						this.focus();
						this.select();
						document.execCommand("delete", false);
						document.execCommand("insertText", false, input);
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
		return this.reactInternalInstance(message).memoizedProps.children.find(e => e.type instanceof Function).props.children.props.user;
	}
	get css() {
		var r = `.replyer {
			position: relative;
			top: -1px;
			margin-left: 5px;
			padding: 3px 5px;
			box-sizing: border-box;
			background: rgba(0, 0, 0, 0.4);
			color: #fff !important;
			font-size: 10px;
			text-transform: uppercase;
			cursor: pointer;
		}
		.message-group:not(:hover) .replyer {
			display: none;
		}`;
		return r;
	}
	unload() {
		this.stop();
	}
	onMessage() {}
	onSwitch() {}
	load() { }
}
