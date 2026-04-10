const MODULE_ID = "impmal-community";
const FLAG_APPLIED = "counterAttackApplied";
const FLAG_USAGE = "counterAttackUsage";
const TALENT_NAME = "Counter Attack";

export function registerCounterAttack() {
    Hooks.once("ready", () => {
        const cls = CONFIG.ChatMessage.documentClass;
        const original = cls.prototype.renderHTML;
        cls.prototype.renderHTML = async function(options) {
            const html = await original.call(this, options);
            if (this.type === "opposed") {
                _injectCounterAttackButton(this, html);
            }
            return html;
        };
    });
}

function _getDefenderActor(message) {
    return fromUuidSync(message.system.targetTokenUuid)?.actor ?? null;
}

function _getMaxUses(actor) {
    const talent = actor.items.find(i => i.type === "talent" && i.name === TALENT_NAME);
    return talent?.system?.taken ?? 0;
}

function _getUsedThisRound(actor) {
    const currentRound = game.combat?.round ?? -1;
    const usage = actor.getFlag(MODULE_ID, FLAG_USAGE) ?? { round: -1, used: 0 };
    return usage.round === currentRound ? (usage.used ?? 0) : 0;
}

function _resolveCounterWeapon(defenderActor, defenderTest) {
    const testItem = defenderTest?.item;
    if (testItem?.system?.isMelee) return testItem;
    return defenderActor.itemTypes.weapon.find(w => w.system.isEquipped && w.system.isMelee) ?? null;
}

function _injectCounterAttackButton(message, html) {
    const result = message.system?.result;
    if (!result || result.winner !== "defender") return;

    const attackerTest = message.system.attackerTest;
    const defenderTest = message.system.defenderTest;
    if (!attackerTest || !defenderTest) return;

    if (!attackerTest.item?.system?.isMelee) return;

    const defenderActor = _getDefenderActor(message);
    if (!defenderActor) return;

    if (!defenderActor.isOwner && !game.user.isGM) return;

    const maxUses = _getMaxUses(defenderActor);
    if (maxUses === 0) return;

    if (message.getFlag(MODULE_ID, FLAG_APPLIED)) return;

    const weapon = _resolveCounterWeapon(defenderActor, defenderTest);
    if (!weapon) return;

    const buttonsDiv = html.querySelector(".opposed-buttons");
    if (!buttonsDiv) return;

    const usedThisRound = _getUsedThisRound(defenderActor);
    const exhausted = usedThisRound >= maxUses;
    const setting = game.settings.get(MODULE_ID, "counterAttack");
    const blocked = exhausted && setting === "enabledEnforced";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("counter-attack-btn");
    btn.disabled = blocked;
    if (exhausted) btn.style.opacity = "0.5";
    btn.dataset.tooltip = exhausted
        ? game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.Exhausted")
        : game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.Button");
    btn.innerHTML = `<i class="fa-solid fa-sword"></i> ${game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.Button")} (${usedThisRound}/${maxUses})`;
    btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        _applyCounterAttack(message, defenderActor);
    });
    buttonsDiv.appendChild(btn);
}

async function _applyCounterAttack(message, defenderActor) {
    if (message.getFlag(MODULE_ID, FLAG_APPLIED)) {
        ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.AlreadyApplied"));
        return;
    }

    const attackerTest = message.system.attackerTest;
    if (!attackerTest?.actor) {
        ui.notifications.error(game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.NoAttacker"));
        return;
    }

    await message.setFlag(MODULE_ID, FLAG_APPLIED, true);

    const currentRound = game.combat?.round ?? -1;
    const usedThisRound = _getUsedThisRound(defenderActor);
    await defenderActor.setFlag(MODULE_ID, FLAG_USAGE, { round: currentRound, used: usedThisRound + 1 });

    const attackerMessage = game.messages.get(message.system.attackerMessageId);
    const attackerSpeaker = attackerMessage?.speaker;
    const attackerTokenUuid = (attackerSpeaker?.scene && attackerSpeaker?.token)
        ? `Scene.${attackerSpeaker.scene}.Token.${attackerSpeaker.token}`
        : null;

    if (!attackerTokenUuid) {
        ui.notifications.error(game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.NoAttacker"));
        await message.unsetFlag(MODULE_ID, FLAG_APPLIED);
        return;
    }

    const newMessage = await ChatMessage.create({
        type: "opposed",
        flavor: game.i18n.localize("IMPMAL_COMMUNITY.CounterAttack.Flavor"),
        speaker: ChatMessage.getSpeaker({ actor: defenderActor }),
        system: {
            attackerMessageId: message.system.defenderMessageId,
            defenderMessageId: message.system.attackerMessageId,
            targetTokenUuid: attackerTokenUuid
        }
    });

    await newMessage.system.renderContent();
}
