//META{"name":"ThemeCustomizer"}*//

var ThemeCustomizer = function () {};

ThemeCustomizer.vars = [];

ThemeCustomizer.prototype.getName = function () {
    return "Theme Customizer";
};

ThemeCustomizer.prototype.getDescription = function () {
    return "Customize CSS Variables of themes<br><br>Thanks to <a href='https://github.com/noodlebox' target='_blank'>@noodlebox</a>, <a href='https://github.com/Jiiks' target='_blank'>@Jiiks</a> and <a href='https://github.com/megamit' target='_blank'>@Mitchell</a> for helping<span style='position: absolute; bottom: 0; right: 14px;'>By <b><a href='https://github.com/Zerthox' target='_blank'>@Zerthox</a></b></span>";
};

ThemeCustomizer.prototype.getVersion = function () {
    return "0.1.8";
};

ThemeCustomizer.prototype.getAuthor = function () {
    return "<a href='https://github.com/Zerthox' target='_blank'>Zerthox</a>";
};

ThemeCustomizer.prototype.getSettingsPanel = function () {
  var settingspanel = "<div id='tc-settingspanel'><h1>Theme Customizer Settings</h1>";
  if (ThemeCustomizer.vars.length > 0) {
    settingspanel += "<div class='tc-controls'>";
    for (var i = 0; i < ThemeCustomizer.vars.length; i++) {
      settingspanel += "<label for='" + ThemeCustomizer.vars[i][1] + "'>" + ThemeCustomizer.vars[i][1] + ": </label>";
      if (ThemeCustomizer.vars[i][2].startsWith("#") || ThemeCustomizer.vars[i][2].startsWith("rgb") || ThemeCustomizer.vars[i][2].startsWith("hsl")) {
        settingspanel +="<input type='text' id='" + ThemeCustomizer.vars[i][1] + "'><script id='" + ThemeCustomizer.vars[i][1] + "'>$('#" + ThemeCustomizer.vars[i][1] + "').spectrum({color: '#" + ThemeCustomizer.vars[i][2] + "', showInput: true, showInitial: true, showAlpha: true});</script><br>";
      }
      else {
        settingspanel +="<input type='text' id='" + ThemeCustomizer.vars[i][1] + "' value='" + ThemeCustomizer.vars[i][2] + "'><br>";
      }
    }
    settingspanel += "<br><div class='tc-buttons'>";
    settingspanel += "<button id='apply' onclick='setVars()'>Apply</button>";
    settingspanel += "<button id='retry' onclick='findVars()'>Reload Variables</button>";
    settingspanel += "<button id='default-settings' onclick='settingsDefault()'>Default Settings</button>";
    settingspanel += "<button id='save' onclick='saveSettings()'>Save</button>";
    settingspanel += "<button id='clear-save' onclick='saveClear()'>Clear Save</button>";
    settingspanel += "</div>";
    settingspanel += "</div>";
  }
  else {
    settingspanel += "<i>No Variables found!<br><span style='font-size: smaller;'>Make sure the Plugin and a Theme with CSS Variables are both enabled!</span></i>"
    settingspanel += "<br><br>";
    settingspanel += "<button id='retry' onclick='findVars()'>Retry</button>";

  }
  settingspanel += "</div>";

  return settingspanel;
};

ThemeCustomizer.prototype.start = function () {

  // Select observer target
  target = document.querySelector('head');
   
  // Create observer
  ThemeCustomizer.observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      findVars();
      refVars();
    });    
  });
   
  // Observer configuration
  config = {
    attributes: true,
    childList: true,
    characterData: true
  };

  // Start observer
  ThemeCustomizer.observer.observe(target, config);

  // Inject Spectrum
  if (!$().spectrum) {
    $("body").append('<script id="spectrumjs" type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js">');
    $("body").append('<link id ="spectrumcss" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css">');
  }

  // Console output
  console.log("%c[Theme Customizer]" + "%c Initialized", "color: #0ff;", "");

  // Load local settings
  ThemeCustomizer.vars = JSON.parse(bdPluginStorage.get("ThemeCustomizer", "vars"));
  if (ThemeCustomizer.vars === null) {

    // Empty variables
    ThemeCustomizer.vars = [];

    // Console output
    console.log("%c[Theme Customizer]" + "%c Failed to load settings", "color: #0ff;", "");

    // Try to find variables
    findVars();
  }
  else {

    // Apply settings
    applyVars();

    // Console output
    console.log("%c[Theme Customizer]" + "%c Settings loaded", "color: #0ff;", "");
  }
};

// REFRESH INPUT VALUES
function refVars() {
  for (var i = 0; i < ThemeCustomizer.vars.length; i++)
    if (ThemeCustomizer.vars[i][2] != null)
      try {
      $("#" + ThemeCustomizer.vars[i][1]).spectrum({color: "#" + ThemeCustomizer.vars[i][2], showInput: true, showInitial: true, showAlpha: true});
    }
    catch(err){}
};

// FIND VARIABLES
function findVars() {

  // Clear variable list
  ThemeCustomizer.vars = [];

  // Console output
  console.log("%c[Theme Customizer]" + "%c Scanning for CSS variables", "color: #0ff;", "");

  // Find CSS variables
  for (var sheet of document.styleSheets) {
    if (sheet === null || sheet.cssRules === null) {
      continue;
    }
    for (var rule of sheet.cssRules) {
      if (rule === null || rule.style === null || rule.type !== CSSRule.STYLE_RULE) {
        continue;
      }
      for (var style of rule.style) {
        if (style === null || !style.startsWith("--")) {
          continue;
        }
        let value = window.getComputedStyle(document.querySelector(rule.selectorText)).getPropertyValue(style);
        ThemeCustomizer.vars.push([rule.selectorText, style.replace("--", ""), value]);
      }
    }
  }

  // Remove hex color clutter
  for (var i = 0; i < ThemeCustomizer.vars.length; i++) {
    ThemeCustomizer.vars[i][2] = ThemeCustomizer.vars[i][2].replace(/( )/g, "");
    if (ThemeCustomizer.vars[i][2].startsWith("#"))
      ThemeCustomizer.vars[i][2] = ThemeCustomizer.vars[i][2].replace(/(\\3)/g, "");
  }
};

// APPLY VARIABLES
function applyVars() {
  for (var i = 0; i < ThemeCustomizer.vars.length; i++) {

    // Set as property values
    document.querySelector(ThemeCustomizer.vars[i][0]).style.setProperty("--" + ThemeCustomizer.vars[i][1], ThemeCustomizer.vars[i][2]);

    // Console output
    console.log("%c[Theme Customizer]" + "%c Set " + ThemeCustomizer.vars[i][1] + " to " + ThemeCustomizer.vars[i][2], "color: #0ff;", "");
    }
};

// SET VARIABLES
function setVars() {
  for (var i = 0; i < ThemeCustomizer.vars.length; i++) {

    // Find variable values
    if (document.querySelector("#" + ThemeCustomizer.vars[i][1]).value.startsWith("hsv")) {
      ThemeCustomizer.vars[i][2] = document.querySelector("#" + ThemeCustomizer.vars[i][1] + " + .sp-replacer .sp-preview-inner").style.backgroundColor;
    }
    else {
      ThemeCustomizer.vars[i][2] = document.querySelector("#" + ThemeCustomizer.vars[i][1]).value;
    }

  applyVars();
  }
};

// RESTORE DEFAULT SETTINGS
function settingsDefault() {

  // Clear property values
  for (var i = 0; i < ThemeCustomizer.vars.length; i++) {
    $(ThemeCustomizer.vars[i][0]).removeAttr('style');
  }

  // Empty variables
  ThemeCustomizer.vars = [];

  // Reload settings
  findVars();
  refVars();

  // Console output
  console.log("%c[Theme Customizer]" + "%c Settings restored to default", "color: #0ff;", "");
};

// SAVE SETTINGS
function saveSettings() {

  // Save settings
  bdPluginStorage.set("ThemeCustomizer", "vars", JSON.stringify(ThemeCustomizer.vars));

  // Console output
  console.log("%c[Theme Customizer]" + "%c Settings saved", "color: #0ff;", "");
};

// CLEAR SAVED SETTINGS
function saveClear() {
  bdPluginStorage.set("ThemeCustomizer", "vars", "");

  // Console output
  console.log("%c[Theme Customizer]" + "%c Cleared saved settings", "color: #0ff;", "");
};

ThemeCustomizer.prototype.stop = function () {

  // Empty variables
  ThemeCustomizer.vars = [];

  // Clear property values
  for (var i = 0; i < ThemeCustomizer.vars.length; i++) {
    $(ThemeCustomizer.vars[i][0]).removeAttr('style');

  // Stop observer
  ThemeCustomizer.observer.disconnect();

  // Console output
  console.log("%c[Theme Customizer]" + "%c Stopped", "color: #0ff;", "");
  }
};

ThemeCustomizer.prototype.load = function () {};

ThemeCustomizer.prototype.unload = function () {};

ThemeCustomizer.prototype.observer = function (e) {};

ThemeCustomizer.prototype.onMessage = function () {};

ThemeCustomizer.prototype.onSwitch = function () {};
