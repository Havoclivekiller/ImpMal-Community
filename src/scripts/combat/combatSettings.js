export default class CombatSettings {
  static moduleName = "impmal-community";

  static addCombatSetting() {
    game.settings.register(this.moduleName, "autoCritKillNpcs", {
      name: game.i18n.localize("IMPMAL_COMMUNITY.autoCritKillNpcs.name"),
      hint: game.i18n.localize("IMPMAL_COMMUNITY.autoCritKillNpcs.hint"),
      scope: "world",
      config: true,
      type: Boolean
    });

    game.settings.register(this.moduleName, "showNpcCrit", {
      name: game.i18n.localize("IMPMAL_COMMUNITY.showNpcCrit.name"),
      hint: game.i18n.localize("IMPMAL_COMMUNITY.showNpcCrit.hint"),
      scope: "world",
      config: true,
      type: Boolean
    });

    game.settings.register(this.moduleName, "deleteIniMessage", {
      name: game.i18n.localize("IMPMAL_COMMUNITY.deleteIniMessage.name"),
      hint: game.i18n.localize("IMPMAL_COMMUNITY.deleteIniMessage.hint"),
      scope: "world",
      config: true,
      type: Boolean
    });
  }
}
