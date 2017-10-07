//META{"name":"BetterReplyer"}*//

class BetterReplyer {
	getName() {
		return "BetterReplyer";
	}
	getDescription() {
		return "Reply to people using their ID (if possible) with a button. Original by @Hammock & @Natsulus.";
	}
	getVersion() {
		return "1.6.1";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	start() {
		$(document).on("mouseover.brpr", function(e) {
			var target = $(e.target);
			if (target.parents(".message").length > 0) {
				var allmessages = $(".messages .message-group");
				var nameDateBlock = $(".messages .message-group .comment .message .body h2");
				var replyBtn = "<span class='replyer' style='cursor:pointer;color:#fff!important;position:relative;top:-1px;margin-left:5px;text-transform:uppercase;font-size:10px;padding:3px 5px;box-sizing:border-box;background:rgba(0,0,0,0.4)'>Reply</span>";
				allmessages.on("mouseover", function() {
					if (nameDateBlock.find(".replyer").length == 0) {
						$(this).find(nameDateBlock).append(replyBtn);
						$(this).find(".replyer").click(function() {
							var id = $(this).parents(".message-group").find(".avatar-large").attr("style").split("/")[4];
							if (id == undefined) {
								$(this).parent().find(".user-name").click();
								var popout = $("[class*='userPopout-']"),
									user = popout.find("[class*='headerUsernameNoNickname-']").text() + popout.find("[class*='headerDiscriminator-']").text();
								popout.remove();
								var mention = "@" + user;
							}
							else {
								var mention = "<@" + id + ">";
							}
							$(".content [class*='channelTextArea-'] textarea").each(function() {
								var input = mention + " " + $(this).val();
								$(this).val("").focus();
								document.execCommand("insertText", false, input);
							});
						});
					}
				});
				allmessages.on("mouseleave", function() {
					if (nameDateBlock.find(".replyer").length == 1) {
						$(this).find(".replyer").empty().remove();
					}
				});
			}
		});
		console.log("[BetterReplyer] Started");
	}
	stop() {
		$(document).off("mouseover.brpr");
		$(".messages .message-group").off("mouseover");
		$(".messages .message-group").off("mouseleave");
	}
	unload() {
		this.stop();
	}
	observer(e) {}
	onMessage() {}
	onSwitch() {}
	load() { }
}
