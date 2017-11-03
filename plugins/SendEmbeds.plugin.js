//META{"name":"SendEmbeds"}*//

class SendEmbeds {
	getName() {
		return "SendEmbeds";
	}
	getDescription() {
		return "Allows the user to send custom rich embed messages.";
	}
	getVersion() {
		return "2.1.1";
	}
	getAuthor() {
		return "Zerthox";
	}
	getSettingsPanel() {
		return null;
	}
	selector(s) {
		var pre = ".chat form",
			outer = "[class*=channelTextArea-]:not([class*=Disabled])",
			inner = "[class*=inner-]";
		var r = "";
		var p = s.includes("pre"),
			o = s.includes("outer"),
			i = s.includes("inner");
		if (p && (o || i)) {
			r += pre + " ";
		}
		else if (p) {
			return pre;
		}
		if (o && i) {
			r += outer + " > ";
		}
		else if (o) {
			return r + outer;
		}
		if (i) {
			return r + inner;
		}
		else if (r.length > 0) {
			return r;
		}
		else {
			return undefined;
		}
	}
	start() {
		if (typeof CryptoJS === "undefined") {
			$("body").append('<script id="cryptojs" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js">');
		}
		this.presets = bdPluginStorage.get(this.getName(), "presets");
		if (this.presets === null) {
			this.presets = {};
		}
		BdApi.injectCSS(this.getName(), this.css());
		if ($(this.selector("pre outer")).length > 0) {
			this.insert();
		}
		console.log("[SendEmbeds] Started");
	}
	stop() {
		BdApi.clearCSS(this.getName());
		$(this.selector("pre outer") + " .sendembeds-button").remove();
		console.log("[SendEmbeds] Stopped");
	}
	observer(e) {
		var a = $(e.addedNodes);
		if (a.is(this.selector("pre outer")) || a.find(this.selector("outer")).is(this.selector("pre outer"))) {
			this.insert();
		}
	}
	insert() {
		var self = this,
		a = $(this.selector("pre outer inner"));
	if (a.length > 0 && a.find(".sendembeds-button").length === 0) {
		a.find("textarea").before('<div class="sendembeds-button"></div>');
		a.find(".sendembeds-button").off().click(function() {
			self.modal();
		});
	}
	}
	getData() {
		var color = $("#color").val();
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
					name: $("#authorname").val(),
					icon_url: $("#authoricon").val()
				},
				description: $("#description").val(),
				footer: {
					text: $("#footertext").val()
				},
				thumbnail: {
					url: $("#thumbnail").val()
				},
				image: {
					url: $("#image").val()
				},
				fields: [],
				color: color,
				url: $("#link").val()
			}
		}
		return data;
	}
	modal() {
		var self = this;
		if ($("#sendembeds").length === 0) {
			var modalhtml = '<div id="sendembeds">';
			if (!self.token) {
				if (bdPluginStorage.get(self.getName(), "token") != null) {
					modalhtml += '<div class="overlay">';
					modalhtml += '<h1>Please enter your Password</h1>';
					modalhtml += '<div>The password is required to decrypt your token.</div>';
					modalhtml += '<div><label for="password">Password: </label><input type="text" id="password"></div>';
					modalhtml += '<div class="button-group">';
				    modalhtml += '<button class="load">Confirm</button>';
				    modalhtml += '<button class="reset">Reset Password & Token</button>';
				    modalhtml += '<button class="close right">Close</button>';
				    modalhtml += '</div></div>';
				}
				else {
					modalhtml += '<div class="overlay">';
					modalhtml += '<h1>Please enter Token & a Password</h1>';
					modalhtml += '<div>The password is used to encrypt your token.</div>';
					modalhtml += '<div><label for="token">Token: </label><input type="text" id="token"></div>';
					modalhtml += '<div><label for="password">Password: </label><input type="text" id="password"></div>';
					modalhtml += '<div class="button-group">';
				    modalhtml += '<button class="save">Confirm</button>';
				    modalhtml += '<button class="close right">Close</button>';
				    modalhtml += '</div></div>';
				}
			}
				modalhtml += '<div class="sendembed">';
			    modalhtml += '<div class="option"><label for="content">Content: </label><input type="text" id="content"></div>';
			    modalhtml += '<div class="option"><label for="authorname">Name: </label><input type="text" id="authorname"></div>';
			    modalhtml += '<div class="option"><label for="authoricon">Icon URL: </label><input type="text" id="authoricon"></div>';
			    modalhtml += '<div class="option"><label for="description">Description: </label><input type="text" id="description"></div>';
			    modalhtml += '<div class="option"><label for="thumbnail">Thumbnail URL: </label><input type="text" id="thumbnail"></div>';
			    modalhtml += '<div class="option"><label for="imageurl">Image URL: </label><input type="text" id="image"></div>';
			    modalhtml += '<div class="option"><label for="footertext">Footer Text: </label><input type="text" id="footertext"></div>';
			    modalhtml += '<div class="option"><label for="link">Link URL: </label><input type="text" id="link"></div>';
			    modalhtml += '<div class="option"><label for="color">Color: <i style="font-size:11px;">(HEX/RGB)</i> </label><input type="text" id="color"></div>';
			    modalhtml += '<div class="button-group">';
			    modalhtml += '<button class="send">Send</button>';
			    modalhtml += '<button class="save">Presets</button>';
			    modalhtml += '<button class="restart">Reenter Password</button>';
			    modalhtml += '<button class="close right">Close</button>';
			    modalhtml += '</div></div></div>';
			$(".chat form").after(modalhtml).promise().done(function() {
				$("#sendembeds .close").click(function() {
					$("#sendembeds").remove();
				});
				$("#sendembeds .sendembed .send").click(function() {
					self.sendEmbed(self.getData());
					$("#sendembeds").remove();
				});
				$("#sendembeds .sendembed .save").click(function() {
					self.modalPreset();
				});
				$("#sendembeds .sendembed .restart").click(function() {
					self.token = false;
					$("#sendembeds").remove();
					self.modal();
				});
				var o = $("#sendembeds .overlay");
				if (o.length > 0) {
					o.find(".save").click(function() {
						var i = $("#sendembeds .overlay #token").val();
						if (i.startsWith('"')) {
							i = i.slice(1);
						}
						if (i.endsWith('"')) {
							i = i.slice(0, -1);
						}
						self.setToken(i, $("#sendembeds .overlay #password").val());						
						$("#sendembeds").remove();
						self.modal();
					});
					o.find(".load").click(function() {
						self.loadToken($("#sendembeds .overlay #password").val());						
						$("#sendembeds").remove();
						self.modal();
					});
					o.find(".reset").click(function() {
						bdPluginStorage.set(self.getName(), "token", null);
						$("#sendembeds").remove();
						self.modal();
					});
				}
			});
		}
		else {
			$("#sendembeds").remove();
		}
	}
	constructor() {
		let storage = new WeakMap(),
			key = {};
		Object.defineProperty(this, "setToken", {
			value: function(token, auth) {
				storage.set(key, token);
				var h = CryptoJS.MD5(auth),
					t = CryptoJS.AES.encrypt(token, h.toString());
				bdPluginStorage.set(this.getName(), "token", t.toString());
				this.token = true;
	        },
			configurable: false,
			writable: false
		});
		Object.defineProperty(this, "loadToken", {
			value: function(auth) {
				var s = bdPluginStorage.get(this.getName(), "token"),
					h = CryptoJS.MD5(auth),
					t = CryptoJS.AES.decrypt(s, h.toString()).toString(CryptoJS.enc.Utf8);
				storage.set(key, t);
				this.token = true;
	        },
			configurable: false,
			writable: false
		});
		Object.defineProperty(this, "sendEmbed", {
			value: function(data) {
				var self = this;
		    	$.ajax({
					type: "POST",
					url: "https://discordapp.com/api/channels/" + window.location.pathname.split('/').pop() + "/messages",
					headers: {
						"authorization": storage.get(key)
					},
					dataType: "json",
					contentType: "application/json",
					data: JSON.stringify(data),
					error: (req, error, exception) => {
						self.alert("SendEmbeds Error", "Error sending message:<br>" + req.responseText);
					}
				});
		    },
			configurable: false,
			writable: false
		});
	}
	modalPreset() {
		var self = this;
		if ($("#sendembeds .presets").length === 0) {
			var presethtml = '<div class="presets">',
				pk = Object.keys(self.presets);
			if (pk.length > 0) {
				presethtml += '<div class="loadpreset"><h1>Load Preset</h1>';
				presethtml += '<span>Preset Name: </span><select name="presetselect" size="1">';
				for (var i = 0; i < pk.length; i++) {
					presethtml += '<option>' + pk[i] + '</option>';
				}
				presethtml += '</select>';
				presethtml += '<div class="buttons">';
				presethtml += '<button class="load">Load</button>';
				presethtml += '<button class="delete">Delete</button>';
				presethtml += '</div>';
				presethtml += '</div>';
			}
			else {
				presethtml += '<div class="loadpreset"><i>No saved Presets</i></div>';
			}
			presethtml += '<div class="savepreset"><h1>Save Preset</h1>';
			presethtml += '<span>Preset Name: </span><input type="text" id="presetname">';
			presethtml += '<div class="buttons">';
			presethtml += '<button class="save">Save</button>';
			presethtml += '</div>';
			presethtml += '</div>';
			presethtml += '<div class="button-group">';
			presethtml += '<button class="cancel right">Cancel</button>';
			presethtml += '</div>';
			presethtml += '</div>';
			$("#sendembeds .sendembed").after(presethtml).promise().done(function() {
				$("#sendembeds .presets .load").click(function() {
					self.loadPreset($("#sendembeds .presets select").val());
				});
				$("#sendembeds .presets .delete").click(function() {
					self.deletePreset($("#sendembeds .presets select").val());
				});
				$("#sendembeds .presets .save").click(function() {
					self.savePreset($("#presetname").val(), self.getData());
				});
				$("#sendembeds .presets .cancel").click(function() {
					self.modalPreset();
				});
			});
			$("#sendembeds .sendembed").css("opacity", "0");
		}
		else {
			$("#sendembeds .presets").remove();
			$("#sendembeds .sendembed").css("opacity", "");
		}
	}
	savePreset(presetname, data) {
		if (presetname.length === 0) {
			var f = this.presets.filter(function(e) {
				if (e.startsWith("Unnamed ")) {
					return e;
				}
			}).sort();
			if (f.length > 0) {
				var i = parseInt(f[f.length - 1].slice(-1)) + 1;
				presetname = "Unnamed " + i;
			}
			else {
				presetname = "Unnamed 1";
			}
		}
		this.presets[presetname] = data;
		bdPluginStorage.set(this.getName(), "presets", this.presets);
		$("#sendembeds .presets").remove();
		$("#sendembeds .sendembed").css("opacity", "");
	}
	loadPreset(presetname) {
		if (this.presets.hasOwnProperty(presetname)) {
			var p = this.presets[presetname];
			var get = function(object, prop) {
				var o = object,
					p = prop.split(".");
				for (var i = 0; i < p.length; i++) {
					o = o[p[i]];
					if (o === undefined) {
						return "";
					}
				}
				return o;
			}
			var data = {
				content: get(p, "content"),
				authorname: get(p, "embed.author.name"),
				authoricon: get(p, "embed.author.icon_url"),
				description: get(p, "embed.description"),
				footertext: get(p, "embed.footer.text"),
				thumbnail: get(p, "embed.thumbnail.url"),
				image: get(p, "embed.image.url"),
				color: get(p, "embed.color"),
				link: get(p, "embed.url")
			}
			$("#sendembeds .sendembed input").each(function() {
				$(this).val(data[$(this).attr("id")]);
			});
		}
		$("#sendembeds .presets").remove();
		$("#sendembeds .sendembed").css("opacity", "");
	}
	deletePreset(presetname) {
		if (this.presets.hasOwnProperty(presetname)) {
			delete this.presets[presetname];
			bdPluginStorage.set(this.getName(), "presets", this.presets);
		}
		$("#sendembeds .presets").remove();
		$("#sendembeds .sendembed").css("opacity", "");
	}
	alert(title, text, target) {
		var html = '<div class="theme-dark"><div class="callout-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>';
			html += '<div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="modal-3HOjGZ modal-KwRiOq size-2pbXxj">';
			html += '<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">';
			html += '<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl">' + title + '</h4>';
			html += '<svg class="close-3RZM3j flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>';
			html += '<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW"><div class="scroller-fzNley inner-tqJwAU content-3KEfmo selectable"><div class="medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn selectable-prgIYK" style="padding-bottom: 20px;">' + text + '</div></div></div></div></div></div></div>';
		var t = target || $(".app").parent().siblings(".theme-dark:eq(2)")[0];
		$(t).html(html).promise().done(function() {
			$(".callout-backdrop, [class*='modal-'] [class*='close-']").click(function() {
				$(t).html("");
			});
		});
	}
	css() {
		var r = `/* SendEmbeds CSS */
		.chat .sendembeds-button {
			display: -webkit-box;
		    display: -ms-flexbox;
			display: flex;
			margin-right: 10px;
			cursor: pointer;
		}
		.chat form .sendembeds-button::before {
			content: url(https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_open_in_browser_white_24px.svg);
			margin: auto;
			pointer-events: none;
			opacity: .2;
		}
		.chat form .sendembeds-button:hover::before {
			opacity: 1;
		}
		.chat [class*="innerEnabledNoAttach"] .sendembeds-button::before {
			padding-right: 0;
			padding-left: 10px;
		}
		#sendembeds {
			position: absolute;
			bottom: 76px;
			margin-left: 20px;
			z-index: 1;
		}
		#sendembeds > * {
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
		#sendembeds .button-group > .right {
			position: absolute;
			right: 0;
		}
		#sendembeds h1 {
			line-height: normal;
			text-align: center;
		}
		#sendembeds .overlay {
			flex-direction: column;
			justify-content: center;
			z-index: 10;
		}
		#sendembeds .overlay > :not(.button-group),
		#sendembeds .overlay input {
			width: 100%;
		}
		#sendembeds .overlay label {
			display: block;
		}
		#sendembeds .overlay > * + :not(.button-group) {
			margin-top: 5px;
		}
		#sendembeds .presets,
		#sendembeds .overlay {
			position: absolute;
			display: flex;
			align-items: center;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
		}
		#sendembeds .presets {
			justify-content: space-around;
			flex-direction: row;
		}
		#sendembeds .presets select {
			width: 100%;
			height: 22px;
		}
		#sendembeds .presets input {
			display: block;
			height: 17px;
		}
		#sendembeds .presets .buttons {
			margin-top: 3px;
		}`;
		return r;
	}
	onMessage() {}
	onSwitch() {}
	load() {}
	unload() {}
}