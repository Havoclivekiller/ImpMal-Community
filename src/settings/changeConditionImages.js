export async function registerChangeConditionImages() {
    const imgPath = game.settings.get("impmal-community", "changeConditionImagesPath").replace(/^\/|\/$/g, "");
    const buildSrc = (fileName) => `${imgPath}/${fileName}`;
    const fileExists = async (fileName) => foundry.utils.srcExists(buildSrc(fileName));

    const setImgIfExists = async (obj, fileName, { includeIcon = false } = {}) => {
        if (!obj) return;
        if (!(await fileExists(fileName))) {
            console.warn(`${CONST.vtt} | Missing condition image: ${buildSrc(fileName)}`);
            return;
        }
        const src = buildSrc(fileName);
        obj.img = src;
        if (includeIcon) obj.icon = src;
    };

    const isLocalizedMatch = (obj, key) => {
        if (!obj) return false;
        const localized = game.i18n?.localize?.(key);
        return obj.name === key || obj.title === key || obj.name === localized || obj.title === localized;
    };

    const setStatusEffect = async (effects, id, fileName) => {
        const objIndex = effects.findIndex((obj) => obj.id === id);
        if (objIndex === -1) return;
        await setImgIfExists(effects[objIndex], fileName, { includeIcon: true });
    };

    const setCondition = async (conditions, name, fileName) => {
        const objIndex = conditions.findIndex((obj) => isLocalizedMatch(obj, name));
        if (objIndex === -1) return;
        await setImgIfExists(conditions[objIndex], fileName);
    };

    const actionsTable = [
        { target: game.impmal.config.actions.aim.effect, file: "aim.webp" },
        { target: game.impmal.config.actions.charge.effect, file: "charge.webp" },
        { target: game.impmal.config.actions.defend.effect, file: "defend.webp" },
        { target: game.impmal.config.actions.dodge.effect, file: "dodge.webp" },
        { target: game.impmal.config.actions.help.effect, file: "help.webp" },
    ];

    const statusTable = [
        { id: "ablaze", file: "ablaze.webp" },
        { id: "bleeding", file: "bleeding.webp" },
        { id: "blinded", file: "blinded.webp" },
        { id: "deafened", file: "deafened.webp" },
        { id: "fatigued", file: "fatigued.webp" },
        { id: "frightened", file: "frightened.webp" },
        { id: "incapacitated", file: "incapacitated.webp" },
        { id: "overburdened", file: "overburdened.webp" },
        { id: "poisoned", file: "poisoned.webp" },
        { id: "prone", file: "prone.webp" },
        { id: "restrained", file: "restrained.webp" },
        { id: "stunned", file: "stunned.webp" },
        { id: "unconscious", file: "unconscious.webp" },
        { id: "dead", file: "dead.webp" },
    ];

    const conditionsTable = [
        { name: "IMPMAL.ConditionAblazeMinor", file: "ablaze-minor.webp" },
        { name: "IMPMAL.ConditionAblazeMajor", file: "ablaze-major.webp" },
        { name: "IMPMAL.ConditionBleedingMinor", file: "bleeding-minor.webp" },
        { name: "IMPMAL.ConditionBleedingMajor", file: "bleeding-major.webp" },
        { name: "IMPMAL.ConditionBlinded", file: "blinded.webp" },
        { name: "IMPMAL.ConditionDeafened", file: "deafened.webp" },
        { name: "IMPMAL.ConditionFatiguedMinor", file: "fatigued-minor.webp" },
        { name: "IMPMAL.ConditionFatiguedMajor", file: "fatigued-major.webp" },
        { name: "IMPMAL.ConditionFrightenedMinor", file: "frightened-minor.webp" },
        { name: "IMPMAL.ConditionFrightenedMajor", file: "frightened-major.webp" },
        { name: "IMPMAL.ConditionOverburdened", file: "overburdened.webp" },
        { name: "IMPMAL.ConditionPoisonedMinor", file: "poisoned-minor.webp" },
        { name: "IMPMAL.ConditionPoisonedMajor", file: "poisoned-major.webp" },
        { name: "IMPMAL.ConditionIncapacitated", file: "incapacitated.webp" },
        { name: "IMPMAL.ConditionProne", file: "prone.webp" },
        { name: "IMPMAL.ConditionRestrainedMinor", file: "restrained-minor.webp" },
        { name: "IMPMAL.ConditionRestrainedMajor", file: "restrained-major.webp" },
        { name: "IMPMAL.ConditionStunnedMinor", file: "stunned-minor.webp" },
        { name: "IMPMAL.ConditionStunnedMajor", file: "stunned-major.webp" },
        { name: "IMPMAL.ConditionUnconscious", file: "unconscious.webp" },
        { name: "IMPMAL.Dead", file: "dead.webp" },
    ];

    const zonesTable = [
        { target: game.impmal.config.zoneEffects.barrier, file: "barrier.webp" },
        { target: game.impmal.config.zoneEffects.lightCover, file: "lightCover.webp" },
        { target: game.impmal.config.zoneEffects.mediumCover, file: "mediumCover.webp" },
        { target: game.impmal.config.zoneEffects.heavyCover, file: "heavyCover.webp" },
        { target: game.impmal.config.zoneEffects.difficultTerrain, file: "difficultTerrain.webp" },
        { target: game.impmal.config.zoneEffects.lightlyObscured, file: "lightlyObscured.webp" },
        { target: game.impmal.config.zoneEffects.heavilyObscured, file: "heavilyObscured.webp" },
        { target: game.impmal.config.zoneEffects.minorHazard, file: "minorHazard.webp" },
        { target: game.impmal.config.zoneEffects.majorHazard, file: "majorHazard.webp" },
        { target: game.impmal.config.zoneEffects.deadlyHazard, file: "deadlyHazard.webp" },
        { target: game.impmal.config.zoneEffects.poorlyLit, file: "poorlyLit.webp" },
        { target: game.impmal.config.zoneEffects.dark, file: "dark.webp" },
        { target: game.impmal.config.zoneEffects.warpTouched, file: "warpTouched.webp" },
    ];

    for (const { target, file } of actionsTable) {
        await setImgIfExists(target, file);
    }

    for (const { id, file } of statusTable) {
        await setStatusEffect(IM_CONFIG.statusEffects, id, file);
        await setStatusEffect(CONFIG.statusEffects, id, file);
    }

    for (const { name, file } of conditionsTable) {
        await setCondition(game.impmal.config.conditions, name, file);
    }

    for (const { target, file } of zonesTable) {
        await setImgIfExists(target, file);
    }
}
