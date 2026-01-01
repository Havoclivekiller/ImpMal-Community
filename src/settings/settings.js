Hooks.on('init', () => {
    registerSettings();
});

function registerSettings() {
    game.settings.register("impmal-community", "alternativeInitiative", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.alternativeInitiative.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.alternativeInitiative.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "alternativeInitiativeFormula", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.alternativeInitiativeFormula.Name"),
        scope: "world",
        config: true,
        default: "d10 + @combat.initiative + @skills.reflexes.total/100",
        requiresReload: true,
        type: String
    });

    game.settings.register("impmal-community", "computeDoublesAll", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.computeDoublesAll.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.computeDoublesAll.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: false,
        type: Boolean
    });

    game.settings.register("impmal-community", "changeConditionImages", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.changeConditionImages.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.changeConditionImages.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "changeConditionImagesPath", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.changeConditionImagesPath.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.changeConditionImagesPath.Hint"),
        scope: "world",
        config: true,
        type: String,
        requiresReload: true,
        filePicker: "folder",
        default: "modules/impmal-community/assets/conditions"
    });

    game.settings.register("impmal-community", "alternativeMasterCrafted", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.alternativeMasterCrafted.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.alternativeMasterCrafted.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "alternativeRend", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.alternativeRend.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.alternativeRend.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "tokenRuler", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.tokenRuler.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.tokenRuler.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "activeSuperiority", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.activeSuperiority.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.activeSuperiority.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "shootingIntoMelee", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.shootingIntoMelee.Name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.shootingIntoMelee.Hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "autoCritKillNpcs", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.autoCritKillNpcs.name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.autoCritKillNpcs.hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "showNpcCrit", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.showNpcCrit.name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.showNpcCrit.hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "deleteIniMessage", {
        name: game.i18n.localize("IMPMAL_COMMUNITY.deleteIniMessage.name"),
        hint: game.i18n.localize("IMPMAL_COMMUNITY.deleteIniMessage.hint"),
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });
}
