//META{"name":"BetterReplyer"}*//

class BetterReplyer {
	getName() {
		return "BetterReplyer";
	}
	getDescription() {
		return "Reply to people using their ID (if possible) with a button. Original by @Hammock & @Natsulus.";
	}
	getVersion() {
		return "1.5";
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
				var isCompact = false;
				var allmessages = $(".messages .message-group");
				var nameDateBlock = $(".messages .message-group .comment .message .body h2");
				var replyBtn = "<span class='replyer' style='cursor:pointer;color:#fff!important;position:relative;top:-1px;margin-left:5px;text-transform:uppercase;font-size:10px;padding:3px 5px;box-sizing:border-box;background:rgba(0,0,0,0.4)'>Reply</span>";
				allmessages.on("mouseover", function() {
					if (nameDateBlock.find(".replyer").length == 0) {
						$(this).find(nameDateBlock).append(replyBtn);
						$(this).find(".replyer").click(function() {
							var id = $(this).parents(".message-group").find(".avatar-large").attr("style").split("/")[4];
							var textarea = $('.content .channelTextArea-1HTP3C textarea')[0]
							var text = "";
							if (id == undefined) {
								$(this).parent().find(".user-name").click();
								var popout = $("[class*='userPopout-']");
								var user = popout.find("[class*='headerUsernameNoNickname-']").text() + popout.find("[class*='headerDiscriminator-']").text();
								tetx = '@' + user +' '+$(".content [class*='channelTextArea-'] textarea").val()
								popout.remove();
							}
							else {
								text = '<@' + id + '> ' + $(".content [class*='channelTextArea-'] textarea").val();
							}
							textarea.focus()
							textarea.selectionStart = 0;
							textarea.selectionEnd = textarea.value.length;
							document.execCommand("insertText", false, text);
							textarea.selectionStart = textarea.value.length;
							textarea.selectionEnd = textarea.value.length;
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