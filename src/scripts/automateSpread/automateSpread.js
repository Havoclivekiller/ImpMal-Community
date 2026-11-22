import { canApplySpread, getAttackDamage, getSpreadDamage, getSpreadTargets } from "./spread-helpers.js";

const MODULE_ID = "impmal-community";
const PREFIX = "IMPMAL_COMMUNITY.Spread.";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

function warn(key) {
    ui.notifications.warn(PREFIX + key, { localize: true });
}

function resolveTokens(actor, opposed, test) {
    const asToken = value => {
        const document = value?.document ?? value;
        return document?.documentName === "Token" && document.parent ? document : null;
    };
    const speaker = test.context?.speaker ?? test.message?.speaker;
    const scene = game.scenes.get(opposed.scene ?? speaker?.scene);
    const target = asToken(opposed.target) ?? asToken(opposed.token)
        ?? (opposed.targetTokenUuid ? asToken(fromUuidSync(opposed.targetTokenUuid)) : null)
        ?? asToken(scene?.tokens.get(opposed.id)) ?? asToken(actor.token);
    if (!target || target.actor?.uuid !== actor.uuid) return {};

    const attacker = asToken(game.scenes.get(speaker?.scene ?? target.parent.id)?.tokens.get(speaker?.token))
        ?? asToken(test.actor?.token)
        ?? (() => {
            const tokens = target.parent.tokens.filter(token => token.actor?.uuid === test.actor?.uuid);
            return tokens.length === 1 ? tokens[0] : null;
        })();
    return { target, attacker };
}

async function requestSpread(actor, value, options, damageData) {
    const settings = game.settings.get(MODULE_ID, "spreadSettings");
    const opposed = options.opposed;
    const test = opposed?.attackerTest;
    if (!canApplySpread(test?.item, test, opposed?.result, damageData, settings)) return;

    const { target, attacker } = resolveTokens(actor, opposed, test);
    if (!target) return warn("NoTarget");
    const meleeFromAttacker = Boolean(test.item.system.isMelee && settings.meleeStartingPointAttacker);
    if (!attacker && (meleeFromAttacker || settings.attackerImmuneToSpread)) return warn("NoAttacker");
    const origin = meleeFromAttacker ? attacker : target;
    const targets = getSpreadTargets(origin, target, attacker, settings);
    if (!targets.length) return;
    if (!game.users.activeGM) return warn("NoGM");

    // Send identifiers and a damage/settings snapshot, never live Documents or Test objects.
    await warhammer.apps.SocketHandlers.call("impmalCommunityShowSpread", {
        attackerMessageId: test.message?.id,
        targetTokenUuid: target.uuid,
        attackerTokenUuid: attacker?.uuid,
        targetUuids: targets.map(token => token.uuid),
        attackDamage: Number(value),
        weaponDamage: Number(getAttackDamage(test.item)?.value ?? 0),
        location: options.location ?? test.result.hitLocation ?? "roll",
        settings: foundry.utils.deepClone(settings)
    }, "GM");
}

async function showSpread(payload) {
    if (!game.user.isGM || !game.settings.get(MODULE_ID, "spreadSettings").enabled) return false;
    const test = game.messages.get(payload.attackerMessageId)?.system.test;
    const originalTarget = await fromUuid(payload.targetTokenUuid);
    const attacker = payload.attackerTokenUuid ? await fromUuid(payload.attackerTokenUuid) : null;
    if (!test?.item || !originalTarget) {
        warn("MissingAttack");
        return false;
    }
    // Preserve the candidate list from the moment the original damage finished applying.
    const tokens = (await Promise.all(payload.targetUuids.map(uuid => fromUuid(uuid))))
        .filter(token => token?.actor?.system?.combat && token.parent?.id === originalTarget.parent.id
            && token.uuid !== originalTarget.uuid
            && !(payload.settings.attackerImmuneToSpread && token.uuid === attacker?.uuid));
    if (!tokens.length) return false;
    const dialog = new SpreadDialog(payload, test, originalTarget, tokens);
    await dialog.render({ force: true });
    return true;
}

/** Give each secondary hit its own trait list and item, without editing the real weapon. */
export function createSpreadTest(test, useTraits) {
    const traits = test.itemTraits.clone();
    traits.list = useTraits ? traits.list.filter(trait => trait.key !== "spread") : [];
    const path = test.item.type === "trait" ? "system.attack.traits.list" : "system.traits.list";
    const item = test.item.clone({ [path]: traits.list.map(trait => ({ ...trait })) }, { keepId: true });
    // Owned item preparation can re-add ammunition/mod traits; replace the resulting list too.
    item.prepareOwnedData();
    const itemTraits = item.type === "trait" ? item.system.attack.traits : item.system.traits;
    itemTraits.list = traits.list.map(trait => ({ ...trait }));
    const spreadTest = Object.create(test);
    Object.defineProperties(spreadTest, {
        item: { value: item },
        itemTraits: { value: traits },
        result: { value: { ...test.result, fireMode: "single", critical: false } }
    });
    return spreadTest;
}

export class SpreadDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ["impmal", "warhammer", "impmal-community-spread"],
        window: {
            title: PREFIX + "Title",
            contentClasses: ["standard-form"],
            resizable: true
        },
        position: { width: 860 },
        actions: { dodge: this._onDodge, half: this._onApplyDamage, full: this._onApplyDamage }
    };

    static PARTS = {
        body: {
            template: "modules/impmal-community/templates/spread-dialog.hbs",
            scrollable: [".spread-targets"]
        }
    };

    constructor(payload, test, originalTarget, tokens, options = {}) {
        super(options);
        this.payload = payload;
        this.test = test;
        this.originalTarget = originalTarget;
        this.tokens = tokens;
        this.applied = new Map();
        this.applying = false;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.attack = game.i18n.format(PREFIX + "Attack", {
            weapon: this.test.item.name,
            target: this.originalTarget.name
        });
        context.halfDamage = getSpreadDamage(this.payload.attackDamage, this.payload.weaponDamage, this.payload.settings);
        context.fullDamage = getSpreadDamage(this.payload.attackDamage, this.payload.weaponDamage, this.payload.settings, true);
        context.tokens = this.tokens.map(token => {
            const role = token.actor.system.role;
            return {
                uuid: token.uuid,
                name: token.name,
                role: typeof role === "string"
                    ? game.i18n.localize(game.impmal.config.npcRoles?.[role] ?? role)
                    : role?.name,
                img: token.texture.src,
                disabled: this.applying || this.applied.has(token.uuid),
                status: this.applied.get(token.uuid)
            };
        });
        return context;
    }

    static async _onDodge(event, button) {
        if (!game.user.isGM || !game.settings.get(MODULE_ID, "spreadSettings").enabled) return;
        const uuid = button.dataset.tokenUuid;
        if (!this.tokens.some(token => token.uuid === uuid)) return;
        try {
            const token = await fromUuid(uuid);
            if (!token?.actor) return warn("MissingToken");
            await token.actor.setupSkillTest(
                { key: "reflexes", name: "Dodge" },
                {
                    appendTitle: " - " + game.i18n.localize("IMPMAL.Spread"),
                    fields: { difficulty: "challenging" },
                    skipTargets: true
                },
                { resolveClose: true }
            );
        }
        catch (error) {
            console.error(`${MODULE_ID} | Spread Dodge test failed`, error);
            ui.notifications.error(PREFIX + "TestError", { localize: true });
        }
    }

    static async _onApplyDamage(event, button) {
        if (!game.user.isGM || this.applying || !game.settings.get(MODULE_ID, "spreadSettings").enabled) return;
        const uuid = button.dataset.tokenUuid;
        if (this.applied.has(uuid) || !this.tokens.some(token => token.uuid === uuid)) return;
        this.applying = true;
        this.render({ force: true });
        try {
            const token = await fromUuid(uuid);
            if (!token?.actor?.system?.combat) return warn("MissingToken");
            const { settings, attackDamage, weaponDamage, location } = this.payload;
            const damage = getSpreadDamage(attackDamage, weaponDamage, settings, button.dataset.action === "full");
            const test = createSpreadTest(this.test, settings.useTraits);
            const opposed = {
                attackerTest: test,
                attackerMessageId: this.payload.attackerMessageId,
                targetTokenUuid: token.uuid,
                target: token,
                actor: token.actor,
                result: { winner: "attacker", damage }
            };
            const data = await token.actor.applyDamage(damage, {
                opposed,
                traits: test.itemTraits,
                location,
                ignoreAP: settings.useTraits && Boolean(getAttackDamage(test.item)?.ignoreAP),
                message: false,
                context: { impmalCommunitySpread: true }
            });
            // Lock the row before applying secondary effects so their failure cannot duplicate wounds.
            this.applied.set(uuid, Number.isFinite(data.woundsGained)
                ? game.i18n.format(PREFIX + "Applied", { wounds: data.woundsGained })
                : game.i18n.format(PREFIX + "DamageApplied", { damage: data.excess ?? data.damage }));
            if (settings.useTraits && data.woundsGained > 0 && test.damageEffects.length) {
                await token.actor.applyEffect({
                    effectUuids: test.damageEffects.map(effect => effect.uuid),
                    messageId: this.payload.attackerMessageId
                });
            }
        }
        catch (error) {
            console.error(`${MODULE_ID} | Spread damage failed`, error);
            ui.notifications.error(PREFIX + "Error", { localize: true });
        }
        finally {
            this.applying = false;
            this.render({ force: true });
        }
    }
}

export function registerAutomateSpread() {
    Hooks.once("ready", () => {
        warhammer.apps.SocketHandlers.register({ impmalCommunityShowSpread: showSpread });
        const prototype = CONFIG.Actor.documentClass.prototype;
        const original = prototype.applyDamage;
        prototype.applyDamage = async function(value, options = {}) {
            const data = await original.call(this, value, options);
            if (options.update === false || options.context?.impmalCommunitySpread) return data;
            // Do not hold up the original chat card on a remote GM query or an open Spread window.
            requestSpread(this, value, options, data).catch(error => {
                console.error(`${MODULE_ID} | Could not open Spread damage window`, error);
            });
            return data;
        };
    });
}
