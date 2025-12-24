import { registerAlternativeInitiative } from "./alternativeInitiative.js";
import { registerAlternativeMasterCrafted } from "./alternativeMasterCrafted.js";
import { registerAlternativeRend } from "./alternativeRend.js";
import { registerChangeConditionImages } from "./changeConditionImages.js";
import { registerTokenRuler } from "./tokenRuler.js";
import { registerActiveSuperiority } from "./activeSuperiority.js";
import { registerPromptRoll } from "./promptRoll.js";

Hooks.on('init', () => {
    registerSettings();
    if (game.settings.get("impmal-community", "tokenRuler") === true) {
        registerTokenRuler();
    }

    if (game.settings.get("impmal-community", "alternativeInitiative") === true) {
        registerAlternativeInitiative();
    }

    if (game.settings.get("impmal-community", "alternativeMasterCrafted") === true) {
        registerAlternativeMasterCrafted();
    }

    if (game.settings.get("impmal-community", "alternativeRend") === true) {
        registerAlternativeRend();
    }

    if (game.settings.get("impmal-community", "changeConditionImages") === true) {
        registerChangeConditionImages();
    }

    if (game.settings.get("impmal-community", "activeSuperiority") === true) {
        registerActiveSuperiority();
    }

    registerPromptRoll();
});

Hooks.on('renderChatMessage', (message, html, messageData) => {
    if (game.settings.get("impmal-community", "computeDoublesAll") === true) {
        if (message.content)
            if (message.content.includes(game.i18n.localize("IMPMAL.Fumble")) || message.content.includes(game.i18n.localize("IMPMAL.Critical"))) {
                return true;
            }

        if (message.rolls[0])
            if ((message.rolls[0].total % 11 === 0) || message.rolls[0].total === 100) {
                if (html[0].querySelector('.sl'))
                    if (html[0].querySelector('.sl').textContent) {
                        let toInsert = html[0].querySelector('.sl').textContent.includes('+') ? game.i18n.localize("IMPMAL.Critical") : game.i18n.localize("IMPMAL.Fumble");
                        html[0].querySelector('.tags').insertAdjacentHTML('beforeend', `<div>${toInsert}</div>`)
                    }
            }
    }
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
}
