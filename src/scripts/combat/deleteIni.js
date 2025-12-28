export default class InitativeHandling {
  static moduleName = "impmal-community";

  static handleIniRoll(message) {
    if (game.settings.get(this.moduleName, "deleteIniMessage")) {
      if (message.flags.core?.initiativeRoll) {
        return false;
      }
    }
  }
}
