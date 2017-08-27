//META{"name":"BetterReplyer"}*//

var BetterReplyer = function () {};

BetterReplyer.prototype.getName = function() {
    return "BetterReplyer";
};

BetterReplyer.prototype.getDescription = function() {
    return "Reply to people using their ID (if possible) with a button<br>Original by <a href='https://github.com/cosmicsalad' target='_blank'>Hammock</a> & <a href='https://github.com/Delivator' target='_blank'>Natsulus</a><span style='position: absolute; bottom: 0; right: 14px;'>By <b><a href='https://github.com/Zerthox' target='_blank'>@Zerthox</a></b></span>";
};

BetterReplyer.prototype.getVersion = function() {
    return "1.3";
};

BetterReplyer.prototype.getAuthor = function() {
    return "Zerthox";
};

BetterReplyer.prototype.start = function() {
	$(document).on("mouseover.brpr", function(e) {
		var target = $(e.target);
		if (target.parents(".message").length > 0) {
			var isCompact = false;
			var allmessages = $('.messages .message-group');
			var nameDateBlock = $('.messages .message-group .comment .message .body h2');
			var replyBtn = '<span class="replyer" style="cursor:pointer;color:#fff!important;position:relative;top:-1px;margin-left:5px;text-transform:uppercase;font-size:10px;padding:3px 5px;box-sizing:border-box;background:rgba(0,0,0,0.4)">Reply</span>';
			allmessages.on('mouseover',function() {
				if (nameDateBlock.find('.replyer').length == 0) {
					$(this).find(nameDateBlock).append(replyBtn);
					$(this).find('.replyer').click(function() {
						id = $(this).parents(".message-group").find(".avatar-large").attr("style").split("/")[4];
						if (id == undefined) {
							$(this).parent().find('.user-name').click();
							var popout = $(".user-popout");
							var user = popout.find('.username').text() + popout.find('.discriminator').text();
							$('.content [class*="channelTextArea-"] textarea').val('@' + user +' '+$('.content [class*="channelTextArea-"] textarea').val()).focus();
							popout.remove();
						}
						else
							$('.content [class*="channelTextArea-"] textarea').val('<@' + id + '> ' + $('.content [class*="channelTextArea-"] textarea').val()).focus();
					});
				}
			});
			allmessages.on('mouseleave',function() {
				if (nameDateBlock.find('.replyer').length == 1) {
					$(this).find('.replyer').empty().remove();
				}
			});
		}
	});
	console.log('[BetterReplyer] Started');
};

BetterReplyer.prototype.load = function() {};

BetterReplyer.prototype.unload = function() {
	$(document).off("mouseover.brpr");
	$('.messages .message-group').off('mouseover');
	$('.messages .message-group').off('mouseleave');
};

BetterReplyer.prototype.stop = function() {
	$(document).off("mouseover.brpr");
	$('.messages .message-group').off('mouseover');
	$('.messages .message-group').off('mouseleave');
};

BetterReplyer.prototype.getSettingsPanel = function() {
	return null;
};

BetterReplyer.prototype.onMessage = function() {};

BetterReplyer.prototype.onSwitch = function() {};
