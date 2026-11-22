const RESISTANCE_TESTS = {
    ablaze:        { key: "reflexes",   name: "Dodge" },
    bleeding:      { key: "fortitude",  name: "Endurance" },
    blinded:       { key: "fortitude",  name: "Pain" },
    deafened:      { key: "fortitude",  name: "Pain" },
    fatigued:      { key: "fortitude",  name: "Endurance" },
    frightened:    { key: "discipline", name: "Fear" },
    incapacitated: { key: "fortitude",  name: "Endurance" },
    overburdened:  { key: "strength",   name: "Might" },
    poisoned:      { key: "fortitude",  name: "Poison" },
    prone:         { key: "reflexes",   name: "Balance" },
    restrained:    { key: "strength",   name: "Might" },
    stunned:       { key: "fortitude",  name: "Pain" },
    unconscious:   { key: "fortitude",  name: "Endurance" }
};

async function inflictResistanceTest({ actorUuid, conditionId }) {
    // Resolve the full UUID so unlinked token actors are tested and updated correctly.
    const target = await fromUuid(actorUuid);
    const condition = game.impmal.config.conditions.find(c => c.id === conditionId);
    const resistance = RESISTANCE_TESTS[conditionId];
    if (!target?.isOwner || !condition || !resistance) return null;

    const test = await target.setupSkillTest(
        resistance,
        {
            appendTitle: " - Resist " + game.i18n.localize(condition.name),
            resist: [conditionId]
        },
        // The library otherwise leaves awaitSubmit pending when the dialog closes.
        { resolveClose: true }
    );

    // Cancelling skips the condition, while allowing applyDamage to finish.
    if (test?.failed) {
        await target.addCondition(conditionId);
    }

    // User queries must return JSON-serializable data, not a Test or ActiveEffect.
    return test ? Boolean(test.failed) : null;
}

export function registerAutomateInflict() {
    Hooks.once("ready", () => {
        warhammer.apps.SocketHandlers.register({ inflictResistanceTest });
    });

    foundry.utils.mergeObject(IMPMAL.weaponTraitEffects, {
        inflict: {
            name: "IMPMAL.Inflict",
            system: {
                transferData: {
                    documentType: "Item"
                },
                scriptData: [{
                    label: "Inflict",
                    trigger: "applyDamage",
                    script: `
                    const item = args.opposed?.attackerTest?.item;
                    const isTrait = item?.type === "trait";
                    const damage = isTrait ? item.system?.attack?.damage : item?.system?.damage;

                    // Traits force prepared SL to true; use the saved checkbox value.
                    const traitSL = isTrait && (item._source?.system?.attack?.damage?.SL ?? damage?.SL);
                    const requiresWounds = isTrait || item?.type === "weapon"
                        ? Boolean(Number(damage?.base) || damage?.characteristic || traitSL)
                        : true;

                    if (requiresWounds && args.woundsGained <= 0) return;

                    const target = args.actor;
                    const traits = args.opposed?.attackerTest?.itemTraits?.list ?? [];

                    if (!target) return;

                    const normalize = value => String(value ?? "").trim().toLowerCase();

                    // Match condition IDs and localized names, including minor/major names.
                    const conditionLookup = new Map();

                    for (const condition of game.impmal.config.conditions) {
                        if (!${JSON.stringify(Object.keys(RESISTANCE_TESTS))}.includes(condition.id)) continue;

                        conditionLookup.set(normalize(condition.id), condition.id);
                        conditionLookup.set(
                            normalize(game.i18n.localize(condition.name)),
                            condition.id
                        );
                    }

                    const inflictConditions = new Set();

                    for (const trait of traits) {
                        if (normalize(trait.key) !== "inflict") continue;

                        for (const value of String(trait.value ?? "").split(",")) {
                            const conditionId = conditionLookup.get(normalize(value));
                            if (conditionId) inflictConditions.add(conditionId);
                        }
                    }

                    for (const conditionId of inflictConditions) {
                        if (game.settings.get("impmal-community", "automateInflict") === "enabled")
                        {
                            await target.addCondition(conditionId);
                            continue;
                        }

                        if (target.system.role === "troop" && game.settings.get("impmal-community", "automateInflict") === "enabledTestNonTroop") {
                            await target.addCondition(conditionId);
                            continue;
                        }

                        try {
                            warhammer.apps.SocketHandlers.executeOnOwner(
                                target,
                                "inflictResistanceTest",
                                { actorUuid: target.uuid, conditionId }
                            );
                        }
                        catch (error) {
                            // A failed/disconnected client must not prevent wounds being saved.
                            console.error("impmal-community | Inflict resistance test failed", error);
                        }
                    }`
                }]
            }
        }
    });
}
