import AutoCritHandling from "./combat/autoCritHandling.js";
import CombatSettings from "./combat/combatSettings.js";
import InitativeHandling from "./combat/deleteIni.js";

Hooks.on("init", () => {
  registerSettings();
});

function registerSettings() {
  CombatSettings.addCombatSetting();
}

Hooks.on("preCreateChatMessage", function (message) {
  return InitativeHandling.handleIniRoll(message);
});

Hooks.on("createChatMessage", async function (message) {
  if (game.users.activeGM !== game.user) return;
  AutoCritHandling.handleCrit(message);
});

Hooks.on("updateChatMessage", async function (message) {
  if (game.users.activeGM !== game.user) return;
  AutoCritHandling.handleCrit(message);
});
