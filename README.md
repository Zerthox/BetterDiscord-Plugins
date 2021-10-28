# BetterDiscord Plugins

### [BetterFolders](/v1/BetterFolders.plugin.js) <sub><sup>`v2.4.0` *(Updated: 12/10/21)*</sup></sub>
Add new functionality to server folders.
Current Features:
- Custom Folder Icons
- Close other folders on open

### [OnlineFriendCount](/v1/OnlineFriendCount.plugin.js) <sub><sup>`v1.5.1 *(Updated: 28/10/21)*</sup></sub>
Add the old online friend count back to guild list. Because nostalgia.

### [VoiceEvents](/v1/VoiceEvents.plugin.js) <sub><sup>`v1.6.0` *(Updated: 01/10/21)*</sup></sub>
Add TTS Event Notifications to your selected Voice Channel. TeamSpeak feeling.

### [BetterVolume](/v1/BetterVolume.plugin.js) <sub><sup>`v1.0.0` *(Updated: 06/05/21)*</sup></sub>
Set user volume values manually instead of using a limited slider.

<br>

---

<br>

## *Old/WIP*

### [BetterReplyer](/v1/BetterReplyer.plugin.js) <sub><sup>`v4.3.3` *(Updated: 06/08/20)*</sup></sub>
Reply to people using their ID with a button.
Inspired by [Replyer](https://github.com/cosmicsalad/Discord-Themes-and-Plugins/blob/master/plugins/replyer.plugin.js) by [@Hammmock#3110](https://github.com/cosmicsalad), [@Natsulus#0001](https://github.com/Delivator) & [@Zerebos#7790](https://github.com/rauenzi).

### [Emulator](/v1/Emulator.plugin.js) <sub><sup>`v1.1.0` *(Updated: 17/02/20)*</sup></sub>
Emulate Windows, MacOS, Linux or Browser on any platform.
**WARNING:** Emulating a different platform may cause unwanted side effects. Use at own risk.

### [VoiceCount](/v1/VoiceCount.plugin.js) <sub><sup>`v0.1.0` *(Updated: 18/04/20)*</sup></sub>
Add a user count to all voice channels.

### [HypeSquadCheatsheet](/v1/HypeSquadCheatsheet.plugin.js) <sub><sup>`v0.1.0` *(Updated: 27/12/19)*</sup></sub>
Display the resulting HypeSquad house next to the questions in the HypeSquad questions modal.

<br>

---

<br>

## Building from source
```sh
# build all plugins
npm run build-all

# build single plugin
npm run build -- --plugin BetterFolders

# build single plugin to BetterDiscord folder & watch for changes
npm run dev -- --plugin BetterFolders
```
