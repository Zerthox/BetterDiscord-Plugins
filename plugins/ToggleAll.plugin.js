//META{"name":"ToggleAll"}*//

var ToggleAll = function () {};
var ToggleAll.ButtonsLoaded = false;

ToggleAll.prototype.getName = function () {
    return "Toggle All";
};

ToggleAll.prototype.getDescription = function () {
    return "Enable/disable all plugins or themes with a button<span style='position: absolute; bottom: 0; right: 14px;'>By <b><a href='https://github.com/Zerthox' target='_blank'>@Zerthox</a></b></span>";
};

ToggleAll.prototype.getVersion = function () {
    return "0.1.1";
};

ToggleAll.prototype.getAuthor = function () {
    return "<a href='https://github.com/Zerthox' target='_blank'>Zerthox</a>";
};

ToggleAll.prototype.getSettingsPanel = function () {
  return null;
};

ToggleAll.prototype.start = function () {

  // Default vars
  ToggleAll.ButtonsLoaded = false;

  // Inject CSS
  BdApi.injectCSS('ToggleAll', '#toggle-all .checkbox::before {content: "All Enabled"; color: #87909C; margin-right: 5px; font-weight: 600;}');

  // Select target
  target = document.querySelector(".modal-container");

  // Try to add buttons
  if (target.contains(document.querySelector(".settings"))) {
    if (!ToggleAll.ButtonsLoaded) {
      addButtons();
    }
  }
  else {
     
    // Create observer
    ToggleAll.observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (target.contains(document.querySelector(".settings"))) {
          document.querySelector(".tab-bar #bd-settings-new").addEventListener("click", function() {
            if (!ToggleAll.ButtonsLoaded) {
              addButtons();
              ToggleAll.observer.disconnect();
            }
          });
        }
      });
    });

    // Observer configuration
    config = {
      childList: true
    };

    // Start observer
    ToggleAll.observer.observe(target, config);
  }

  // Console output
  console.log("%c[Toggle All]" + "%c Started", "color: #ff1e00;", "");
};

// ADD BUTTONS
function addButtons() {
  ToggleAll.ButtonsLoaded = true;
  $('#bd-plugins-pane .bda-slist-top').append('<div id="toggle-all"><div class="checkbox" onclick="togglePlugins();" style="float: right;"><div class="checkbox-inner"><input id="toggle-plugins" type="checkbox" checked=""><span></span></div><span></span></div></div>');
  $('#bd-themes-pane .bda-slist-top').append('<div id="toggle-all"><div class="checkbox" onclick="toggleThemes();" style="float: right;"><div class="checkbox-inner"><input id="toggle-themes" type="checkbox" checked=""><span></span></div><span></span></div></div>');
  console.log("%c[Toggle All]" + "%c Added buttons", "color: #ff1e00;", "");
};

// TOGGLE PLUGINS
function togglePlugins() {
  let input = document.querySelector("#toggle-all #toggle-plugins");
  let count = $("#bd-plugins-pane ul li").length;
  let checkbox = $("#bd-plugins-pane ul input");
  if (input.checked) {
    input.checked = false;
    for (i = 0; i < count; i++) {
      if (checkbox[i].id != "Toggle__All") {
        checkbox[i].checked = false;
        checkbox[i].click();
      }
    }
    console.log("%c[Toggle All]" + "%c Disabled all plugins", "color: #ff1e00;", "");
  }
  else {
    input.checked = true;
    for (i = 0; i < count; i++) {
      if (checkbox[i].id != "Toggle__All") {
        checkbox[i].checked = true;
        checkbox[i].click();
      }
    }
    console.log("%c[Toggle All]" + "%c Enabled all plugins", "color: #ff1e00;", "");
  }
};

// TOGGLE THEMES
function toggleThemes() {
  let input = document.querySelector("#toggle-all #toggle-themes");
  let count = $("#bd-themes-pane ul li").length;
  let checkbox = $("#bd-themes-pane ul input");
  if (input.checked) {
    input.checked = false;
    for (i = 0; i < count; i++) {
      checkbox[i].checked = false;
      checkbox[i].click();
    }
    console.log("%c[Toggle All]" + "%c Disabled all themes", "color: #ff1e00;", "");
  }
  else {
    input.checked = true;
    for (i = 0; i < count; i++) {
      checkbox[i].checked = true;
      checkbox[i].click();
    }
    console.log("%c[Toggle All]" + "%c Enabled all themes", "color: #ff1e00;", "");
  }
};

ToggleAll.prototype.stop = function () {

  // Clear CSS
  BdApi.clearCSS('ToggleAll');

  // Stop observer
  ToggleAll.observer.disconnect();

  // Remove buttons
  if (ToggleAll.ButtonsLoaded) {
    try {
    document.getElementById("toggle-all").remove();
    }
    catch(err){}
  }

  // Console output
  console.log("%c[Toggle All]" + "%c Stopped", "color: #ff1e00;", "");
};

ToggleAll.prototype.load = function () {};

ToggleAll.prototype.unload = function () {};

ToggleAll.prototype.observer = function (e) {};

ToggleAll.prototype.onMessage = function () {};

ToggleAll.prototype.onSwitch = function () {};
