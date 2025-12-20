import { registerAlternativeInitiative } from "./alternativeInitiative.js";
import { registerAlternativeMasterCrafted } from "./alternativeMasterCrafted.js";
import { registerAlternativeRend } from "./alternativeRend.js";
import { registerChangeConditionImages } from "./changeConditionImages.js";
import { registerTokenRuler } from "./tokenRuler.js";

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
});

Hooks.on('renderChatMessage', (message, html, messageData) => {
    if (game.settings.get("impmal-community", "computeDoublesAll") === true) {
        if (message.content)
            if (message.content.includes(game.i18n.localize("IMPMAL.Fumble")) || message.content.includes(game.i18n.localize("IMPMAL.Critical"))) {
                return true;
            }

        if (message.rolls[0])
            if ((message.rolls[0].total % 11 === 0) || message.rolls[0].total === 100) {
                let toInsert = html[0].querySelector('.sl').textContent.includes('+') ? game.i18n.localize("IMPMAL.Critical") : game.i18n.localize("IMPMAL.Fumble");
                html[0].querySelector('.tags').insertAdjacentHTML('beforeend', `<div>${toInsert}</div>`)
            }
    }
});

function registerSettings() {
    game.settings.register("impmal-community", "alternativeInitiative", {
        name: "Alternative Initiative",
        hint: "Use alternative initiative from the formula below. Requires restart.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "alternativeInitiativeFormula", {
        name: "Alternative Initiative Formula",
        scope: "world",
        config: true,
        default: "d10 + @combat.initiative + @skills.reflexes.total/100",
        requiresReload: true,
        type: String
    });

    game.settings.register("impmal-community", "computeDoublesAll", {
        name: "Add Critical/Fumble on all tests",
        hint: "Not all tests add Critical/Fumble on tests. This will add a tag below the result.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: false,
        type: Boolean
    });

    game.settings.register("impmal-community", "changeConditionImages", {
        name: "Change Conditions/Effects images",
        hint: "Will change (upon restart) the default condition images.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "changeConditionImagesPath", {
        name: "Path to custom Conditions/Effects images",
        hint: "Change to your folder of images (need to be webp)",
        scope: "world",
        config: true,
        type: String,
        requiresReload: true,
        filePicker: "folder",
        default: "modules/impmal-community/assets/conditions"
    });

    game.settings.register("impmal-community", "alternativeMasterCrafted", {
        name: "Alternative Master Crafted",
        hint: "Reduces the amount of Armour Master Crafted quality gives to Armour from +2 to +1, except for Power armour.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "alternativeRend", {
        name: "Boosted Rend",
        hint: "The Rend trait gains Penetrating equal to 1/2 of Rend, rounded down.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });

    game.settings.register("impmal-community", "tokenRuler", {
        name: "Token Movement Measurement",
        hint: "When you drag a token, the ruler will change color based on speed.",
        scope: "world",
        config: true,
        default: false,
        requiresReload: true,
        type: Boolean
    });
}
