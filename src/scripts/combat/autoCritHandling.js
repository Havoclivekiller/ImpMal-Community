export default class AutoCritHandling {
  static moduleName = "impmal-community";
  static critComputed = "critComputed";

  static handleCrit(message) {
    if (!game.settings.get(this.moduleName, "autoCritKillNpcs")) return;

    if (message.system.result?.critical && !message.getFlag(this.moduleName, this.critComputed)) {
      this.addAttackCrit(message);
    }

    if (message.system.applied?.critical && !message.getFlag(this.moduleName, this.critComputed)) {
      this.addOpposedCrit(message);
    }
  }

  static killOnCrit(actor) {
    if (actor.type != "npc" || actor.statuses.has("dead")) return;

    let currentCriticals = actor.system.combat.criticals.value;
    let maxCriticals = actor.system.combat.criticals.max;

    if (currentCriticals > maxCriticals) {
      actor.toggleStatusEffect("dead", { overlay: true });
      return;
    }
  }

  static async addAttackCrit(message) {
    var dom = document.createElement("div");
    dom.innerHTML = message.content;
    let critSection = dom.querySelector(".critical");

    if (!critSection) return;

    let key = critSection.dataset.table;
    let formula = critSection.dataset.formula;

    message.system.context.targetSpeakers.forEach(async speaker => {
      let actor = ChatMessage.getSpeakerActor(speaker);
      if (actor.type != "npc") {
        return;
      }

      let crit = await ImpMalTables.rollTable(key, formula, {
        showRoll: false,
        showResult: game.settings.get(this.moduleName, "showNpcCrit")
      });

      let item = await game.impmal.utility.findId(crit.documentId);

      await actor.createEmbeddedDocuments("Item", [item]);
      this.killOnCrit(actor);
    });
    message.setFlag(this.moduleName, this.critComputed, true);
  }

  static async addOpposedCrit(message) {
    let actor = fromUuidSync(message.system.targetTokenUuid).actor;
    if (actor.type != "npc") {
      return;
    }

    var dom = document.createElement("div");
    dom.innerHTML = message.content;
    let critSection = dom.querySelector(".critical")?.querySelector(".table-roll");

    if (!critSection) return;

    let key = critSection.dataset.table;
    let formula = critSection.dataset.formula;

    let crit = await ImpMalTables.rollTable(key, formula, {
      showRoll: false,
      showResult: game.settings.get(this.moduleName, "showNpcCrit")
    });

    let item = await game.impmal.utility.findId(crit.documentId);

    await actor.createEmbeddedDocuments("Item", [item]);
    message.setFlag(this.moduleName, this.critComputed, true);

    this.killOnCrit(actor);
  }
}
