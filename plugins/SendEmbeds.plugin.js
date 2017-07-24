//META{"name":"SendEmbeds"}*//

var SendEmbeds = function () {};

// PUT YOUR TOKEN HERE
SendEmbeds.token = "";

SendEmbeds.prototype.getName = function () {
  return "SendEmbeds";
};

SendEmbeds.prototype.getDescription = function () {
  return "Allows you to send custom embed messages<br>Requires your token<span style='position: absolute; bottom: 0; right: 14px;'>By <b><a href='https://github.com/Zerthox' target='_blank'>@Zerthox</a></b></span>";
};

SendEmbeds.prototype.getVersion = function () {
  return "1.0.5";
};

SendEmbeds.prototype.getAuthor = function () {
  return "<a href='https://github.com/Zerthox' target='_blank'>Zerthox</a>";
};

SendEmbeds.prototype.getSettingsPanel = function () {
  return null;
};

SendEmbeds.prototype.start = function () {
  SendEmbeds.presets = bdPluginStorage.get("SendEmbeds", "presetnames");
  if (SendEmbeds.presets === null) {
    SendEmbeds.presets = [];
  }
  BdApi.injectCSS("SendEmbeds", `
div[class*="channelTextArea"] {
  -webkit-animation: textareaInserted .1ms;
  animation: textareaInserted .1ms;
}
@-webkit-keyframes textareaInserted {
  from {
    outline-color: initial;
  }
  to {
    outline-color: initial;
  }
}
@keyframes textareaInserted {
  from {
    outline-color: initial;
  }
  to {
    outline-color: initial;
  }
}
div[class*="channelTextArea"] .send-embeds {
  position: relative;
  width: 45px;
  margin: -12px 3px -12px -10px;
  opacity: .2;
  cursor: pointer;
}
div[class*="channelTextArea"] .send-embeds:hover {
  opacity: 1;
}
div[class*="channelTextArea"] .send-embeds::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: url(https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_send_white_24px.svg) 50% no-repeat;
  -webkit-transform: rotate(-90deg);
  transform: rotate(-90deg);
  pointer-events: none;
}
#sendembeds {
  position: absolute;
  bottom: 76px;
  margin-left: 20px;
  z-index: 1;
}
#sendembeds .sendembed,
#sendembeds .presets {
  background-color: #2e3136;
  padding: 10px 10px 20px;
}
#sendembeds .sendembed {
  display: table;
  border-spacing: 0 5px;
}
#sendembeds .sendembed .option {
  display: table-row;
}
#sendembeds .sendembed .option > * {
  display: table-cell;
}
#sendembeds .sendembed .option input {
  width: 250px;
  margin-left: 5px;
}
#sendembeds .button-group {
  position: absolute;
  width: calc(100% - 20px);
  top: calc(100% - 24px);
}
#sendembeds .button-group button + button,
#sendembeds .buttons button + button {
  margin-left: 3px;
}
#sendembeds .button-group .cancel {
  position: absolute;
  right: 0;
}
#sendembeds .presets {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
#sendembeds .presets h1 {
  text-align: center;
}
#sendembeds .presets select {
  width: 100%;
}
#sendembeds .presets .buttons {
  margin-top: 3px;
}`);
    if ($('div[class*="channelTextArea"] .send-embeds').length === 0)
      $('div[class*="channelTextArea"] textarea').before('<div class="send-embeds"></div>');
      $('div[class*="channelTextArea"] .send-embeds').off().click(function() {
        SendEmbeds.prototype.showModal(true);
      });

  document.addEventListener('webkitAnimationStart', SendEmbeds.event, false);
  document.addEventListener('animationstart', SendEmbeds.event, false);
  console.log("[SendEmbeds] Started")
};

SendEmbeds.prototype.stop = function () {
  BdApi.clearCSS("SendEmbeds");
  $('div[class*="channelTextArea"] .send-embeds').remove();
  document.removeEventListener('webkitAnimationStart', SendEmbeds.event, false);
  document.removeEventListener('animationstart', SendEmbeds.event, false);
};

SendEmbeds.prototype.sendEmbed = function (data) {
  $.ajax({
    type: "POST",
    url: "https://discordapp.com/api/channels/" + window.location.pathname.split('/').pop() + "/messages",
    headers: {
      "authorization": SendEmbeds.token
    },
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    error: (req, error, exception) => {
      console.log(req.responseText);
    }
  });
};

SendEmbeds.prototype.getData = function (a) {
  color = $("#color").val();
  if (color.length === 0) {
    color = null;
  }
  else if (color.startsWith("rgb(")) {
    color = color.split(",");
    color[0] = Number(color[0].split('rgb(')[1]);
    color[1] = Number(color[1]);
    color[2] = Number(color[2].split(')')[0]);
    color = Number('0x' + rgbToHex(color[0], color[1], color[2]).toString());
  }
  else if (color.startsWith("#")) {
    color = parseInt(color.slice(1), 16);
  }
  var data = {
    content: $("#content").val(),
    embed: {
      author: {
        name: $("#name").val(),
        icon_url: $("#iconurl").val()
      },
      description: $("#desc").val(),
      footer: {
        text: $("#footertext").val()
      },
      image: {
        url: $("#imageurl").val()
      },
      fields: [],
      color: color,
      url: $("#link").val()
    }
  }
  if (a) {
    SendEmbeds.prototype.sendEmbed(data);
    SendEmbeds.prototype.showModal();
  }
  else {
    SendEmbeds.prototype.saveEmbed($("#presetname").val(), data);
  }
};

SendEmbeds.prototype.saveEmbed = function (presetname, data) {
  bdPluginStorage.set("SendEmbeds", presetname, data);
  if (SendEmbeds.presets != null) {
    SendEmbeds.presets[this.length] = presetname;
  }
  else {
    SendEmbeds.presets = [];
    SendEmbeds.presets[0] = presetname;
  }
  bdPluginStorage.set("SendEmbeds", "presetnames", SendEmbeds.presets);
  SendEmbeds.prototype.showPresetModal();
};

SendEmbeds.prototype.loadEmbed = function () {
  var data = bdPluginStorage.get("SendEmbeds", $("#sendembeds .presets select").val());
  $("#content").val(data.content);
  $("#name").val(data.embed.author.name);
  $("#iconurl").val(data.embed.author.icon_url);
  $("#desc").val(data.embed.description);
  $("#footertext").val(data.embed.footer.text);
  $("#imageurl").val(data.embed.image.url);
  $("#color").val(data.embed.color);
  $("#link").val(data.embed.url);
  SendEmbeds.prototype.showPresetModal();
};

SendEmbeds.prototype.deleteEmbed = function () {
  v = $("#sendembeds .presets select").val();
  i = $.inArray(v, SendEmbeds.presets);
  if (i > -1) {
    SendEmbeds.presets.splice(i, 1);
    bdPluginStorage.set("SendEmbeds", "presetnames", SendEmbeds.presets);
    bdPluginStorage.set("SendEmbeds", v, null);
    SendEmbeds.prototype.showPresetModal();
  }
  else {
    Core.prototype.alert("SendEmbeds Error", "Error deleting preset, can not find preset");
  }
};

SendEmbeds.prototype.showModal = function () {
  if ($("#sendembeds").length === 0) {
    var modalhtml = '<div id="sendembeds"><div class="sendembed">';
        modalhtml += '<div class="option"><label for="content">Content: </label><input type="text" id="content"></div>';
        modalhtml += '<div class="option"><label for="name">Name: </label><input type="text" id="name"></div>';
        modalhtml += '<div class="option"><label for="iconurl">Icon URL: </label><input type="text" id="iconurl"></div>';
        modalhtml += '<div class="option"><label for="desc">Description: </label><input type="text" id="desc"></div>';
        modalhtml += '<div class="option"><label for="imageurl">Image URL: </label><input type="text" id="imageurl"></div>';
        modalhtml += '<div class="option"><label for="footertext">Footer Text: </label><input type="text" id="footertext"></div>';
        modalhtml += '<div class="option"><label for="link">Link URL: </label><input type="text" id="link"></div>';
        modalhtml += '<div class="option"><label for="color">Color: <i style="font-size:11px;">(HEX/RGB)</i> </label><input type="text" id="color"></div>';
        modalhtml += '<div class="button-group">';
        modalhtml += '<button class="send" onclick="SendEmbeds.prototype.getData(true)">Send</button>';
        modalhtml += '<button class="save" onclick="SendEmbeds.prototype.showPresetModal()">Presets</button>';
        modalhtml += '<button class="cancel" onclick="SendEmbeds.prototype.showModal()">Cancel</button>';
        modalhtml += '</div></div></div>';
    $(".chat form").after(modalhtml);
  }
  else {
    $("#sendembeds").remove();
  }
};

SendEmbeds.prototype.showPresetModal = function () {
  if ($("#sendembeds .presets").length === 0) {
    var presethtml = '<div class="presets">';
        if (SendEmbeds.presets != null) {
          presethtml += '<div class="loadpreset"><h1>Load Preset</h1><select name="presetselect" size="1">';
          for (var i = 0; i < SendEmbeds.presets.length; i++) {
            presethtml += '<option>' + SendEmbeds.presets[i]  + '</option>';
          }
          presethtml += '</select>';
          presethtml += '<div class="buttons">';
          presethtml += '<button class="save" onclick="SendEmbeds.prototype.loadEmbed()">Load</button>';
          presethtml += '<button class="save" onclick="SendEmbeds.prototype.deleteEmbed()">Delete</button>';
          presethtml += '</div>';
          presethtml += '</div>';
        }
        else {
          presethtml += '<div class="loadpreset"><i>No saved Presets</i></div>';
        }
        presethtml += '<div class="savepreset"><h1>Save Preset</h1>';
        presethtml += '<label for="presetname">Preset Name: </label><input type="text" id="presetname">';
        presethtml += '<div class="buttons">';
        presethtml += '<button class="save" onclick="SendEmbeds.prototype.getData(false)">Save</button>';
        presethtml += '</div>';
        presethtml += '</div>';
        presethtml += '<div class="button-group">';
        presethtml += '<button class="cancel" onclick="SendEmbeds.prototype.showPresetModal()">Cancel</button>';
        presethtml += '</div>';
        presethtml += '</div>';
    $("#sendembeds .sendembed").after(presethtml);
    $("#sendembeds .sendembed").css("opacity", "0");
  }
  else {
    $("#sendembeds .presets").remove();
    $("#sendembeds .sendembed").css("opacity", "");
  }
};

SendEmbeds.prototype.load = function () {};

SendEmbeds.prototype.unload = function () {};

SendEmbeds.prototype.observer = function (e) {
	if (!e.addedNodes.length) return;

    var $elem = $(e.addedNodes[0]);

	if ($elem.find(".channelTextArea-1HTP3C").length || $elem.closest(".channelTextArea-1HTP3C").length) {
	  if ($('div[class*="channelTextArea"] .send-embeds').length === 0)
      $('div[class*="channelTextArea"] textarea').before('<div class="send-embeds"></div>');
      $('div[class*="channelTextArea"] .send-embeds').off().click(function() {
        SendEmbeds.prototype.showModal(true);
      });
    }

};

SendEmbeds.prototype.onSwitch = function () {};
