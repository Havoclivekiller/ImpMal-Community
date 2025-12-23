export function registerChangeConditionImages() {
    let imgPath = game.settings.get("impmal-community", "changeConditionImagesPath").replace(/^\/|\/$/g, "");

    // TODO: Check if file exists
    // Actions
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

    // Status Icons
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionAblaze");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/ablaze.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/ablaze.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionAblaze");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/ablaze.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/ablaze.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBleeding");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/bleeding.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/bleeding.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBleeding");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/bleeding.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/bleeding.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBlinded");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/blinded.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/blinded.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBlinded");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/blinded.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/blinded.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionDeafened");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/deafened.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/deafened.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionDeafened");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/deafened.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/deafened.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFatigued");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/fatigued.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/fatigued.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFatigued");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/fatigued.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/fatigued.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFrightened");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/frightened.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/frightened.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFrightened");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/frightened.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/frightened.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionIncapacitated");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/incapacitated.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/incapacitated.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionIncapacitated");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/incapacitated.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/incapacitated.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionOverburdened");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/overburdened.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/overburdened.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionOverburdened");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/overburdened.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/overburdened.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionPoisoned");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/poisoned.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/poisoned.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionPoisoned");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/poisoned.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/poisoned.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionProne");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/prone.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/prone.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionProne");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/prone.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/prone.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionRestrained");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/restrained.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/restrained.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionRestrained");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/restrained.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/restrained.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionStunned");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/stunned.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/stunned.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionStunned");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/stunned.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/stunned.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionUnconscious");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/unconscious.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/unconscious.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionUnconscious");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/unconscious.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/unconscious.webp";
    }
    if (true) {
        let objIndex = IM_CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.Dead");
        IM_CONFIG.statusEffects[objIndex].img = imgPath + "/dead.webp";
        IM_CONFIG.statusEffects[objIndex].icon = imgPath + "/dead.webp";
        let objIndex2 = CONFIG.statusEffects.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.Dead");
        CONFIG.statusEffects[objIndex2].img = imgPath + "/dead.webp";
        CONFIG.statusEffects[objIndex2].icon = imgPath + "/dead.webp";
    }

    // Conditions
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionAblazeMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/ablaze-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionAblazeMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/ablaze-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBleedingMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/bleeding-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBleedingMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/bleeding-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionBlinded");
        game.impmal.config.conditions[objIndex].img = imgPath + "/blinded.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionDeafened");
        game.impmal.config.conditions[objIndex].img = imgPath + "/deafened.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFatiguedMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/fatigued-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFatiguedMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/fatigued-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFrightenedMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/frightened-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionFrightenedMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/frightened-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionOverburdened");
        game.impmal.config.conditions[objIndex].img = imgPath + "/overburdened.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionPoisonedMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/poisoned-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionPoisonedMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/poisoned-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionIncapacitated");
        game.impmal.config.conditions[objIndex].img = imgPath + "/incapacitated.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionProne");
        game.impmal.config.conditions[objIndex].img = imgPath + "/prone.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionRestrainedMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/restrained-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionRestrainedMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/restrained-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionStunnedMinor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/stunned-minor.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionStunnedMajor");
        game.impmal.config.conditions[objIndex].img = imgPath + "/stunned-major.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.ConditionUnconscious");
        game.impmal.config.conditions[objIndex].img = imgPath + "/unconscious.webp";
    }
    if (true) {
        let objIndex = game.impmal.config.conditions.findIndex(obj => obj.name == "IMPMAL_COMMUNITY.Dead");
        game.impmal.config.conditions[objIndex].img = imgPath + "/dead.webp";
    }

    // Zone Effects
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
