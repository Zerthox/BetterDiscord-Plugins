# BetterDiscord Plugins

### [BetterFolders](/dist/bd/BetterFolders.plugin.js) <sub><sup>`v2.4.0` *(Updated: 12/10/21)*</sup></sub>
Add new functionality to server folders.
Current Features:
- Custom Folder Icons
- Close other folders on open

### [OnlineFriendCount](/dist/bd/OnlineFriendCount.plugin.js) <sub><sup>`v2.0.0` *(Updated: 07/11/21)*</sup></sub>
Add the old online friend count back to guild list. Because nostalgia.

### [VoiceEvents](/dist/bd/VoiceEvents.plugin.js) <sub><sup>`v2.0.0` *(Updated: 07/11/21)*</sup></sub>
Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.

### [BetterVolume](/dist/bd/BetterVolume.plugin.js) <sub><sup>`v2.0.0` *(Updated: 07/11/21)*</sup></sub>
Set user volume values manually instead of using a limited slider.

## *Old Plugins*

### [BetterReplyer](/old/BetterReplyer.plugin.js) <sub><sup>`v4.3.3` *(Updated: 06/08/20)*</sup></sub>
Reply to people using their ID with a button.
Inspired by [Replyer](https://github.com/cosmicsalad/Discord-Themes-and-Plugins/blob/master/plugins/replyer.plugin.js) by [@Hammmock#3110](https://github.com/cosmicsalad), [@Natsulus#0001](https://github.com/Delivator) & [@Zerebos#7790](https://github.com/rauenzi).

### [Emulator](/old/Emulator.plugin.js) <sub><sup>`v1.1.0` *(Updated: 17/02/20)*</sup></sub>
Emulate Windows, MacOS, Linux or Browser on any platform.
**WARNING:** Emulating a different platform may cause unwanted side effects. Use at own risk.

### [VoiceCount](/old/VoiceCount.plugin.js) <sub><sup>`v0.1.0` *(Updated: 18/04/20)*</sup></sub>
Add a user count to all voice channels.

### [HypeSquadCheatsheet](/old/HypeSquadCheatsheet.plugin.js) <sub><sup>`v0.1.0` *(Updated: 27/12/19)*</sup></sub>
Display the resulting HypeSquad house next to the questions in the HypeSquad questions modal.

<br>

---

<br>

## Building from source
```sh
# install dependencies
npm install

# build all plugins
npm run build

# build single plugin
npm run build -- BetterFolders

# build single plugin to BetterDiscord folder & watch for changes
npm run dev -- BetterFolders
```
