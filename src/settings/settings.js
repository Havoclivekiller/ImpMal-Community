Hooks.on('init', () => {
    registerSettings();

    if (game.settings.get("impmal-community", "alternativeInitiative") === true) {
        CONFIG.Combat.initiative = {
            formula: game.settings.get("impmal-community", "alternativeInitiativeFormula"),
        };
    }

    if (game.settings.get("impmal-community", "changeConditionImages") === true) {
        let imgPath = game.settings.get("impmal-community", "changeConditionImagesPath").replace(/^\/|\/$/g, "");

        //TODO: Check if file exists
        //Actions
        if (true) {
            game.impmal.config.actions.aim.effect.img = imgPath + "/aim.webp";
        }
        if (true) {
            game.impmal.config.actions.charge.effect.img = imgPath + "/charge.webp";
        }
        if (true) {
            game.impmal.config.actions.defend.effect.img = imgPath + "/defend.webp";
        }
        if (true) {
            game.impmal.config.actions.dodge.effect.img = imgPath + "/dodge.webp";
        }
        if (true) {
            game.impmal.config.actions.help.effect.img = imgPath + "/help.webp";
        }

        //Status Icons
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionAblaze");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/ablaze.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/ablaze.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionBleeding");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/bleeding.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/bleeding.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionBlinded");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/blinded.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/blinded.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionDeafened");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/deafened.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/deafened.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionFatigued");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/fatigued.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/fatigued.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionFrightened");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/frightened.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/frightened.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionIncapacitated");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/incapacitated.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/incapacitated.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionOverburdened");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/overburdened.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/overburdened.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionPoisoned");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/poisoned.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/poisoned.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionProne");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/prone.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/prone.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionRestrained");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/restrained.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/restrained.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionStunned");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/stunned.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/stunned.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.ConditionUnconscious");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/unconscious.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/unconscious.webp";
        }
        if (true) {
            let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL.Dead");
            IM_CONFIG.statusEffects[objIndex].img = imgPath + "/dead.webp";
            IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/dead.webp";
        }

        //Conditions
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionAblazeMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/ablaze-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionAblazeMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/ablaze-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionBleedingMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/bleeding-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionBleedingMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/bleeding-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionBlinded");
            game.impmal.config.conditions[objIndex].img = imgPath + "/blinded.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionDeafened");
            game.impmal.config.conditions[objIndex].img = imgPath + "/deafened.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionFatiguedMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/fatigued-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionFatiguedMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/fatigued-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionFrightenedMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/frightened-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionFrightenedMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/frightened-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionOverburdened");
            game.impmal.config.conditions[objIndex].img = imgPath + "/overburdened.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionPoisonedMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/poisoned-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionPoisonedMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/poisoned-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionIncapacitated");
            game.impmal.config.conditions[objIndex].img = imgPath + "/incapacitated.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionProne");
            game.impmal.config.conditions[objIndex].img = imgPath + "/prone.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionRestrainedMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/restrained-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionRestrainedMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/restrained-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionStunnedMinor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/stunned-minor.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionStunnedMajor");
            game.impmal.config.conditions[objIndex].img = imgPath + "/stunned-major.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.ConditionUnconscious");
            game.impmal.config.conditions[objIndex].img = imgPath + "/unconscious.webp";
        }
        if (true) {
            let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL.Dead");
            game.impmal.config.conditions[objIndex].img = imgPath + "/dead.webp";
        }

        //Zone Effects
        if (true) {
            game.impmal.config.zoneEffects.barrier.img = imgPath + "/barrier.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.lightCover.img = imgPath + "/lightCover.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.mediumCover.img = imgPath + "/mediumCover.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.heavyCover.img = imgPath + "/heavyCover.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.difficultTerrain.img = imgPath + "/difficultTerrain.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.lightlyObscured.img = imgPath + "/lightlyObscured.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.heavilyObscured.img = imgPath + "/heavilyObscured.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.minorHazard.img = imgPath + "/minorHazard.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.majorHazard.img = imgPath + "/majorHazard.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.deadlyHazard.img = imgPath + "/deadlyHazard.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.poorlyLit.img = imgPath + "/poorlyLit.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.dark.img = imgPath + "/dark.webp";
        }
        if (true) {
            game.impmal.config.zoneEffects.warpTouched.img = imgPath + "/warpTouched.webp";
        }
    }
});

Hooks.on('renderChatMessage', (message, html, messageData) => {
    if (game.settings.get("impmal-community", "computeDoublesAll") === true) {
        if (message.content.includes(game.i18n.localize("IMPMAL.Fumble")) || message.content.includes(game.i18n.localize("IMPMAL.Critical"))) {
            return true;
        }
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
}