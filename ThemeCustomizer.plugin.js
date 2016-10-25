//META{"name":"ThemeCustomizer"}*//

var ThemeCustomizer = function () {};

var vars = [];
var save = false;

ThemeCustomizer.prototype.getName = function () {
    return "Theme Customizer BETA";
};

ThemeCustomizer.prototype.getDescription = function () {
    return "Customize CSS Variables of themes<br><br>Thanks to <a href='https://github.com/noodlebox' target='_blank'>@noodlebox</a>, <a href='https://github.com/Jiiks' target='_blank'>@Jiiks</a> and <a href='https://github.com/megamit' target='_blank'>@Mitchell</a> for helping<span style='position: absolute; bottom: 0; right: 14px;'>By <b><a href='https://github.com/Zerthox' target='_blank'>@Zerthox</a></b></span>";
};

ThemeCustomizer.prototype.getVersion = function () {
    return "0.1.1";
};

ThemeCustomizer.prototype.getAuthor = function () {
    return "<a href='https://github.com/Zerthox' target='_blank'>Zerthox</a>";
};

ThemeCustomizer.prototype.getSettingsPanel = function () {
  var settingspanel = "<div id='tc-settingspanel'><h1>Theme Customizer Settings</h1>";

  if (vars.length > 0) {
    settingspanel += "<div class='tc-controls'>";
    for (var i = 0; i <= (vars.length-1); i++) {
      settingspanel += "<label for='" + vars[i][1] + "'>" + vars[i][1] + ": </label>";
      if (vars[i][2].startsWith("#") || vars[i][2].startsWith("rgb") || vars[i][2].startsWith("hsl")) {
        settingspanel +="<input type='text' id='" + vars[i][1] + "'><script id='" + vars[i][1] + "'>$('#" + vars[i][1] + "').spectrum({color: '#" + vars[i][2] + "', showInput: true, showInitial: true, showAlpha: true});</script><br>";
      }
      else {
        settingspanel +="<input type='text' id='" + vars[i][1] + "' value='" + vars[i][2] + "'><br>";
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
  observeStyles = new MutationObserver(function(mutations) {
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
  observeStyles.observe(target, config);

  // Inject Spectrum JS
  var spectrumjs = document.createElement('script');
  spectrumjs.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.js');
  document.querySelector("body").appendChild(spectrumjs);

  // Inject Spectrum CSS
  var spectrumcss = document.createElement('link');
  spectrumcss.setAttribute('rel','stylesheet');
  spectrumcss.setAttribute('href','https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.8.0/spectrum.min.css');
  document.querySelector("body").appendChild(spectrumcss);

  // Console output
  console.log("%c[Theme Customizer]" + "%c Initialized", "color: #0ff;", "");

  // Load local settings
  vars = JSON.parse(localStorage.getItem("ThemeCustomizer"));
  if (vars === null) {

    // Empty variables
    vars = [];
    save = false;

    // Console output
    console.log("%c[Theme Customizer]" + "%c Failed to load settings", "color: #0ff;", "");

    // Try to find variables
    findVars();
  }
  else {
    save = true;

    // Apply settings
    applyVars();

    // Console output
    console.log("%c[Theme Customizer]" + "%c Settings loaded", "color: #0ff;", "");
  }
};

// REFRESH INPUT VALUES
function refVars() {
  for (var i = 0; i <= (vars.length-1); i++)
    if (vars[i][2] != null)
      $("#" + vars[i][1]).spectrum({color: "#" + vars[i][2], showInput: true, showInitial: true, showAlpha: true});
};

// FIND VARIABLES
function findVars() {

  // Clear variable list
  vars = [];

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
        vars.push([rule.selectorText, style.replace("--", ""), value]);
      }
    }
  }

  // Remove hex color clutter
  for (var i = 0; i <= (vars.length-1); i++) {
    vars[i][2] = vars[i][2].replace(/( )/g, "");
    if (vars[i][2].startsWith("#"))
      vars[i][2] = vars[i][2].replace(/(\\3)/g, "");
  }
};

// APPLY VARIABLES
function applyVars() {
  for (var i = 0; i <= (vars.length-1); i++) {

    // Set as property values
    document.querySelector(vars[i][0]).style.setProperty("--" + vars[i][1], vars[i][2]);

    // Console output
    console.log("%c[Theme Customizer]" + "%c Set " + vars[i][1] + " to " + vars[i][2], "color: #0ff;", "");
    }
};

// SET VARIABLES
function setVars() {
  for (var i = 0; i <= (vars.length-1); i++) {

    // Find variable values
    if (document.querySelector("#" + vars[i][1]).value.startsWith("hsv")) {
      vars[i][2] = document.querySelector("#" + vars[i][1] + " + .sp-replacer .sp-preview-inner").style.backgroundColor;
    }
    else {
      vars[i][2] = document.querySelector("#" + vars[i][1]).value;
    }

  applyVars();
  }
};

// RESTORE DEFAULT SETTINGS
function settingsDefault() {

  // Clear property values
  for (var i = 0; i <= (vars.length-1); i++) {
    $(vars[i][0]).removeAttr('style');
  }

  // Empty variables
  vars = [];
  save = false;

  // Reload settings
  findVars();
  refVars();

  // Console output
  console.log("%c[Theme Customizer]" + "%c Settings restored to default", "color: #0ff;", "");
};

// SAVE SETTINGS
function saveSettings() {

  // Save settings
  localStorage.setItem("ThemeCustomizer", JSON.stringify(vars));

  // Console output
  console.log("%c[Theme Customizer]" + "%c Settings saved", "color: #0ff;", "");
};

// CLEAR SAVED SETTINGS
function saveClear() {
  localStorage.removeItem("ThemeCustomizer");

  // Console output
  console.log("%c[Theme Customizer]" + "%c Cleared saved settings", "color: #0ff;", "");
};

ThemeCustomizer.prototype.stop = function () {

  // Empty variables
  vars= [];

  // Clear property values
  for (var i = 0; i <= (vars.length-1); i++) {
    $(vars[i][0]).removeAttr('style');

  // Stop observer
  observeStyles.disconnect();

  // Console output
  console.log("%c[Theme Customizer]" + "%c Stopped", "color: #0ff;", "");
  }
};

ThemeCustomizer.prototype.load = function () {};

ThemeCustomizer.prototype.unload = function () {};

ThemeCustomizer.prototype.observer = function (e) {};

ThemeCustomizer.prototype.onMessage = function () {};

ThemeCustomizer.prototype.onSwitch = function () {};
