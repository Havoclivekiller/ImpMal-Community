import { IMPMAL_COMMUNITY } from "./constants.js";

const old_applyDamageStandardActorModel = StandardActorModel.prototype.applyDamage;

export function registerAlternativeRend() {
    StandardActorModel.prototype.applyDamage = new_applyDamageStandardActorModel;
}

async function new_applyDamageStandardActorModel(value, { ignoreAP = false, location = "roll", message = false, opposed, update = true, context = {} } = {}) {
    let modifiers = [];
    let traits = opposed?.attackerTest?.itemTraits;
    let locationKey;
    if (typeof location == "string") {
        if (location == "roll") {
            locationKey = this.combat.randomHitLoc();
        }
        else // if location is some other string, assume it is the location key
        {
            locationKey = location;
        }
    }
    else if (typeof location == "number") {
        locationKey = this.combat.hitLocAt(location);
    }
    let locationData = this.combat.hitLocations[locationKey];

    let args = { actor: this.parent, value, ignoreAP, modifiers, locationData, opposed, traits, context };
    await Promise.all(opposed?.attackerTest?.actor.runScripts("preApplyDamage", args) || []);
    await Promise.all(opposed?.attackerTest?.item?.runScripts?.("preApplyDamage", args) || []);
    await Promise.all(this.parent.runScripts("preTakeDamage", args));
    // Reassign primitive values that might've changed in the scripts
    value = args.value;
    ignoreAP = args.ignoreAP;

    let woundsGained = value;
    let armourRoll;

    if (locationData.field) {
        await locationData.field.system.applyField(value, modifiers);
    }

    if (!ignoreAP && (locationData.armour || locationData.formula)) {
        let armourValue = locationData.armour || 0;
        if (locationData.formula) {
            armourRoll = new Roll(locationData.formula);
            await armourRoll.roll();
            if (game.dice3d) {
                game.dice3d.showForRoll(armourRoll);
            }
            armourValue += armourRoll.total;
        }

        ///This is our change to REND. If system method changes, we apply these changes
        let totalPen = 0;
        let penetrating = traits?.has("penetrating");
        if (penetrating) totalPen += Number(penetrating.value || 0);
        let rendPenetrating = traits?.has("rend");
        if (rendPenetrating) totalPen += Math.floor(Number(rendPenetrating.value || 0) / IMPMAL_COMMUNITY.rendDivider);
        if (totalPen > 0) {
            armourValue = Math.max(0, armourValue - totalPen);
            modifiers.push({ value: totalPen, label: game.i18n.localize("IMPMAL.Penetrating"), applied: true });
        }
        // End of our changes to Rend having Penetrating

        modifiers.push({ value: -armourValue, label: game.i18n.localize("IMPMAL.Protection"), armour: true });
        if (traits?.has("ineffective")) {
            modifiers.push({ value: -armourValue, label: game.i18n.localize("IMPMAL.Ineffective"), armour: true });
        }
    }

    for (let modifier of modifiers) {
        // Skip modifier if it's from armour when ignoreAP is true, or if the modifier has already been applied
        if (!modifier.applied && (!modifier.armour || !ignoreAP)) {
            woundsGained += Number(modifier.value || 0);
        }
    }
    woundsGained = Math.max(0, woundsGained);

    let excess = 0;
    let critical = false;
    if ((woundsGained + this.combat.wounds.value) > this.combat.wounds.max) {
        excess = (woundsGained + this.combat.wounds.value) - this.combat.wounds.max;
        critical = true;
    }

    let critModifier = opposed?.attackerTest?.result.critModifier;
    let text = "";
    args = { actor: this.parent, woundsGained, locationData, opposed, critModifier, excess, critical, text, modifiers, context };
    await Promise.all(opposed?.attackerTest?.actor.runScripts("applyDamage", args) || []);
    await Promise.all(opposed?.attackerTest?.item?.runScripts?.("applyDamage", args) || []);
    await Promise.all(this.parent.runScripts("takeDamage", args));
    woundsGained = args.woundsGained;
    critModifier = args.critModifier;
    excess = args.excess;
    critical = args.critical;
    text = args.text;
    // A script might replace text
    text = text || game.i18n.format("IMPMAL.WoundsTaken", { wounds: woundsGained, location: game.i18n.localize(locationData.label) });
    let critFormula = ``;
    if (excess) {
        critFormula += " + " + excess;
    }
    if (critModifier) {
        critFormula += " + " + critModifier;
    }
    let critString;
    if (critical) {
        critString = ` <a class="table-roll" data-table="crit${game.impmal.config.generalizedHitLocations[locationKey]}" data-formula="1d10 + ${critFormula}"><i class="fa-solid fa-dice-d10"></i>Critical ${critFormula}</a>`;
    }

    let updateData = { "system.combat.wounds.value": this.combat.wounds.value + woundsGained };

    let damageData = {
        damage: value,
        text,
        woundsGained,
        message: message ? ChatMessage.create({ content: (`<p>${text}</p>` + `<p>${(critString ? critString : "")}</p>`), speaker: ChatMessage.getSpeaker({ actor: this.parent }) }) : null,
        modifiers,
        critical: critString,
        excess,
        location,
        updateData,
        armourRoll
    };

    if (update) {
        await this.parent.update(updateData);
    }
    if (traits?.has("rend")) {
        damageData.rend = traits.has("rend").value;
        // TODO: this isn't supported if update flag is false
        if (update) {
            await this.parent.damageArmour(locationKey, damageData.rend, null, { prompt: true, rend: true });
        }
    }
    return damageData;
}
