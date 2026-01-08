const MODULE_ID = "impmal-community";
const SOCKET_NAME = `module.${MODULE_ID}`;
const ACTIVE_SUPERIORITY_TEMPLATE = "modules/impmal-community/templates/active-superiority-test-dialog.hbs";
const DIALOG_CLASSES = [
    TestDialog,
    CharacteristicTestDialog,
    SkillTestDialog,
    PowerTestDialog,
    AttackDialog,
    TraitTestDialog,
    WeaponTestDialog
];
export function registerActiveSuperiority() {
    registerActiveSuperioritySettings();
    registerActiveSuperiorityResource();
    registerActiveSuperioritySpendDialog();
    registerActiveSuperiorityGainDialog();
    registerActiveSuperiorityCombatTrackerResources();
    registerActiveSuperiorityHooks();
    registerActiveSuperioritySocket();
    registerActiveSuperiorityTestDialogContext();
}
function registerActiveSuperiorityTestDialogContext() {
    const original = TestDialog.prototype._prepareContext;
    const originalDefaultFields = TestDialog.prototype._defaultFields;
    const originalOnFieldChange = TestDialog.prototype._onFieldChange;
    DIALOG_CLASSES.forEach((DialogClass) => {
        insertActiveSuperiorityPart(DialogClass);
    });
    DIALOG_CLASSES.forEach(overrideStaticSubmit);

    TestDialog.prototype._defaultFields = function () {
        const fields = originalDefaultFields.call(this);
        return foundry.utils.mergeObject(fields, {
            activeSuperiority: 0
        });
    };

    TestDialog.prototype._prepareContext = async function (options) {

        const context = await original.call(this, options);

        this.fields.state = this.computeState();
        context.showSuperiority = false;
        context.showActiveSuperiority = isActorInCombat(this.actor);
        context.activeSuperiorityLabel = getActiveSuperiorityLabel(this.actor);
        return context;
    };

    TestDialog.prototype.computeFields = async function () {
        const spend = Number(this.fields.activeSuperiority || 0);

        if (spend > 0) {
            const bonusSl = Math.max(0, spend - 2);
            this.fields.advantage = Number(this.fields.advantage || 0) + 1;
            this.fields.SL = Number(this.fields.SL || 0) + bonusSl;
            this.fields.useSuperiority = true;

            this.tooltips.add("advantage", 1, game.i18n.localize("IMPMAL_COMMUNITY.ActiveSuperiority.Label"));
            if (bonusSl) {
                this.tooltips.add("SL", bonusSl, game.i18n.localize("IMPMAL_COMMUNITY.ActiveSuperiority.Label"));
            }
        } else {
            this.fields.useSuperiority = false;
        }

        if (this.fields.fateAdvantage) {
            this.advCount++;
            this.tooltips.add("advantage", 1, "Using Fate");
        }
    };

    TestDialog.prototype._onFieldChange = async function (ev) {
        if (ev?.currentTarget?.name === "activeSuperiority") {
            const requested = Number(ev.currentTarget.value || 0);
            if (requested > 0) {
                const pool = getActiveSuperiorityPool(this.actor);
                const available = getSuperiorityValueSync(pool);
                const cost = getActiveSuperiorityCost(this.actor, requested);
                if (available < cost) {
                    ui.notifications.error(`Not enough Superiority in ${getPoolLabel(pool)} pool (${available} available, ${cost} needed).`);
                    ev.currentTarget.value = "0";
                    this.userEntry.activeSuperiority = 0;
                    this.render(true);
                    return;
                }
            }
        }

        return originalOnFieldChange.call(this, ev);
    };
}

function insertActiveSuperiorityPart(DialogClass) {
    if (!DialogClass?.PARTS || DialogClass.PARTS.activeSuperiority?.template === ACTIVE_SUPERIORITY_TEMPLATE) {
        return;
    }

    const newParts = {};
    let inserted = false;
    for (const [key, value] of Object.entries(DialogClass.PARTS)) {
        if (key === "state" && !inserted) {
            newParts.activeSuperiority = {
                template: ACTIVE_SUPERIORITY_TEMPLATE,
                fields: true
            };
            inserted = true;
        }
        newParts[key] = value;
    }

    if (!inserted) {
        newParts.activeSuperiority = {
            template: ACTIVE_SUPERIORITY_TEMPLATE,
            fields: true
        };
    }

    DialogClass.PARTS = newParts;
}

function registerActiveSuperioritySettings() {
    game.settings.register("impmal-community", "superiorityEnemy", {
        name: "IMPMAL_COMMUNITY.SuperiorityEnemy",
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });
}

function registerActiveSuperiorityResource() {
    const register = () => {
        if (!game.impmal?.resources) {
            return;
        }

        if (!game.impmal.resources.resources?.superiorityEnemy) {
            game.impmal.resources.registerResource("IMPMAL_COMMUNITY.SuperiorityEnemy", "impmal-community", "superiorityEnemy");
        }
    };

    if (game.impmal?.resources) {
        register();
    } else {
        Hooks.once("ready", register);
    }
}

function registerActiveSuperioritySpendDialog() {
    Hooks.once("ready", () => {
        game.impmalCommunity = game.impmalCommunity || {};
        game.impmalCommunity.SuperioritySpendDialog = SuperioritySpendDialog;
        game.impmalCommunity.openSuperioritySpendDialog = (data = {}) => SuperioritySpendDialog.prompt(data);
    });
}

function registerActiveSuperiorityGainDialog() {
    Hooks.once("ready", () => {
        game.impmalCommunity = game.impmalCommunity || {};
        game.impmalCommunity.SuperiorityGainDialog = SuperiorityGainDialog;
        game.impmalCommunity.openSuperiorityGainDialog = (data = {}) => SuperiorityGainDialog.prompt(data);
    });
}

function registerActiveSuperiorityCombatTrackerResources() {
    Hooks.on("renderCombatTracker", async (app, html) => {
        const root = html?.[0] ?? html;
        if (!root?.querySelector) {
            return;
        }

        const header = root.querySelector(".combat-tracker-header");
        if (!header) {
            return;
        }

        const existing = header.querySelector(".resources");
        if (existing) {
            existing.remove();
        }

        const resourceManager = game.impmal?.resources;
        if (!resourceManager) {
            return;
        }

        const isGM = game.user.isGM;
        const alliedResource = resourceManager.resources?.superiority;
        const enemyResource = resourceManager.resources?.superiorityEnemy;

        const canShowAllied = alliedResource && (isGM || !alliedResource.hidden);
        const canShowEnemy = enemyResource && (isGM || !enemyResource.hidden);

        if (!canShowAllied && !canShowEnemy) {
            return;
        }

        const templatePath = "modules/impmal-community/templates/active-superiority.hbs";
        const rendered = await renderTemplate(templatePath, {
            isGM,
            title: game.i18n.localize("IMPMAL.Superiority"),
            allied: canShowAllied
                ? {
                    key: alliedResource.key,
                    label: game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityAllied"),
                    value: resourceManager.get(alliedResource.key)
                }
                : null,
            enemy: canShowEnemy
                ? {
                    key: enemyResource.key,
                    label: game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityEnemy"),
                    value: resourceManager.get(enemyResource.key)
                }
                : null
        });
        header.insertAdjacentHTML("beforeend", rendered);

        const resourcesElement = header.querySelector(".resources");
        if (!resourcesElement) {
            return;
        }

        resourcesElement.querySelectorAll("button[data-delta]").forEach((button) => {
            if (!isGM) {
                button.disabled = true;
                return;
            }

            button.addEventListener("click", (ev) => {
                ev.preventDefault();
                const key = button.dataset.key;
                const delta = Number(button.dataset.delta || 0);
                const current = Number(resourceManager.get(key) || 0);
                const next = current + delta;
                resourceManager.set(key, next);

                const input = resourcesElement.querySelector(`input[data-key="${key}"]`);
                if (input) {
                    input.value = `${next}`;
                }
            });
        });

        resourcesElement.querySelectorAll(".resource input").forEach((input) => {
            if (!isGM) {
                input.disabled = true;
            }

            input.addEventListener("focusin", (ev) => {
                ev.target.select();
            });

            input.addEventListener("change", (ev) => {
                resourceManager.set(ev.target.dataset.key, ev.target.value);
            });
        });
    });
}

function registerActiveSuperiorityHooks() {
    let lastSuperiorityEnemy = null;
    let lastSuperiorityAllied = null;

    Hooks.on("ready", () => {
        lastSuperiorityEnemy = game.settings.get("impmal-community", "superiorityEnemy");
        lastSuperiorityAllied = game.settings.get("impmal", "superiority");
    });

    Hooks.on("impmal:superiorityEnemyChanged", (value) => {
        postSuperiorityMessage(game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityEnemy") + " " + game.i18n.localize("IMPMAL.Superiority"), value, lastSuperiorityEnemy);
        lastSuperiorityEnemy = value;
    });

    const handlers = Hooks.events?.["impmal:superiorityChanged"];
    if (!Array.isArray(handlers)) {
        return;
    }

    for (const handler of [...handlers]) {
        const fn = typeof handler === "function" ? handler : handler?.fn;
        if (fn) {
            Hooks.off("impmal:superiorityChanged", fn);
        }
    }

    Hooks.on("impmal:superiorityChanged", superiority => {

        // Change the superiority field of any open sheets manually to avoid losing data being submitted
        for (let sheet of Array.from(foundry.applications.instances.values()).filter(i => i instanceof CharacterSheet)) {
            const input = sheet.element?.querySelector(".superiority-update");
            if (input) {
                input.value = superiority;
            }
        }

        postSuperiorityMessage(game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityAllied") + " " + game.i18n.localize("IMPMAL.Superiority"), superiority, lastSuperiorityAllied);
        lastSuperiorityAllied = superiority;

    });
}

function registerActiveSuperioritySocket() {
    Hooks.on("ready", () => {
        game.socket.on(SOCKET_NAME, (data) => {
            if (!game.user.isGM) {
                return;
            }
            if (!data || data.type !== "activeSuperioritySpend") {
                return;
            }

            const spend = Number(data.payload?.spend || 0);
            if (!spend) {
                return;
            }

            const pool = data.payload?.pool || "allied";
            const available = getSuperiorityValueSync(pool);
            if (available < spend) {
                ui.notifications.error(`Not enough Superiority in ${getPoolLabel(pool)} pool (${available} available, ${spend} needed).`);
                return;
            }

            setSuperiorityValue(pool, available - spend);
            postDialogMessage("Spent", pool, spend);
        });
    });
}

function postSuperiorityMessage(labelKey, value, previous) {
    if (!game.user.isGM) {
        return;
    }

    let previousText = Number.isFinite(previous) ? `${previous}` : "?";
    let content = `${labelKey}: ${previousText} -> ${value}`;

    ui.notifications.info(content);
}

class SuperioritySpendDialog extends WHFormApplication {
    static DEFAULT_OPTIONS = {
        classes: ["superiority-dialog", "impmal"],
        tag: "form",
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        window: {
            resizable: false,
            title: "IMPMAL_COMMUNITY.SuperioritySpend.Title"
        },
        position: {
            width: 420
        }
    };

    static PARTS = {
        form: {
            template: "modules/impmal-community/templates/superiority-spend-dialog.hbs",
            classes: ["standard-form"]
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    constructor(data, options) {
        super(null, options);
        this.data = data || {};
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.spendCosts = IMPMAL.superiority.spend
        context.pool = this.data.pool || "allied";
        context.makeItCount = Number(this.data.makeItCount ?? 0);
        context.additionalAction = this.data.additionalAction ?? false;
        context.littleBoost = this.data.littleBoost ?? false;
        context.fleeFromHarm = this.data.fleeFromHarm ?? false;
        context.breakDown = this.data.breakDown ?? false;
        context.custom = Number(this.data.custom ?? 0);
        return context;
    }

    async _onRender(options) {
        await super._onRender(options);
    }

    static async submit(event, form, formData) {
        let data = formData.object;
        let pool = data.pool || "allied";
        let makeItCountCost = Number(data.makeItCount || 0);
        let totalCost = makeItCountCost + Number(data.custom || 0);

        let supconfig = IMPMAL.superiority.spend;

        if (data.additionalAction) {
            totalCost += supconfig.additionalAction;
        }
        if (data.littleBoost) {
            totalCost += supconfig.littleBoost;
        }
        if (data.fleeFromHarm) {
            totalCost += supconfig.fleeFromHarm;
        }
        if (data.breakDown) {
            totalCost += supconfig.breakDown;
        }
        if (!totalCost) {
            ui.notifications.warn("No option selected.");
            return data;
        }

        let current = await getSuperiorityValue(pool);
        if (current < totalCost) {
            ui.notifications.error(`Not enough Superiority (${current} available, ${totalCost} needed).`);
            return data;
        }

        await setSuperiorityValue(pool, current - totalCost);
        postDialogMessage("Spent", pool, totalCost);
        ui.notifications.info(`Spent ${totalCost} Superiority (${pool}).`);
        return data;
    }

    static async prompt({ pool, makeItCount, additionalAction, littleBoost, fleeFromHarm, breakDown, custom } = {}) {
        return new Promise((resolve) => {
            new this({ pool, makeItCount, additionalAction, littleBoost, fleeFromHarm, breakDown, custom }, { resolve }).render(true);
        });
    }
}

class SuperiorityGainDialog extends WHFormApplication {
    static DEFAULT_OPTIONS = {
        classes: ["superiority-dialog", "impmal"],
        tag: "form",
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        window: {
            resizable: false,
            title: "IMPMAL_COMMUNITY.SuperiorityGain.Title"
        },
        position: {
            width: 420
        }
    };

    static PARTS = {
        form: {
            template: "modules/impmal-community/templates/superiority-gain-dialog.hbs",
            classes: ["standard-form"]
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    constructor(data, options) {
        super(null, options);
        this.data = data || {};
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.gainAmounts = IMPMAL.superiority.gain;
        context.pool = this.data.pool || "allied";
        context.surprise = this.data.surprise ?? false;
        context.sizeUp = this.data.sizeUp ?? false;
        context.sizeUpPlus = this.data.sizeUpPlus ?? false;
        context.victory = this.data.victory ?? false;
        context.greaterVictory = this.data.greaterVictory ?? false;
        context.winning = this.data.winning ?? false;
        context.outmanoeuvre = this.data.outmanoeuvre ?? false;
        context.woundedPride = this.data.woundedPride ?? false;
        context.custom = Number(this.data.custom ?? 0);
        return context;
    }

    static async submit(event, form, formData) {
        let data = formData.object;
        let pool = data.pool || "allied";
        let totalGain = Number(data.custom || 0);

        let supconfig = IMPMAL.superiority.gain;

        if (data.surprise) {
            totalGain += supconfig.surprise;
        }
        if (data.sizeUp) {
            totalGain += supconfig.sizeUp;
        }
        if (data.sizeUpPlus) {
            totalGain += supconfig.sizeUpPlus;
        }
        if (data.victory) {
            totalGain += supconfig.victory;
        }
        if (data.greaterVictory) {
            totalGain += supconfig.greaterVictory;
        }
        if (data.winning) {
            totalGain += supconfig.winning;
        }
        if (data.outmanoeuvre) {
            totalGain += supconfig.outmanoeuvre;
        }
        if (data.woundedPride) {
            totalGain += supconfig.woundedPride;
        }

        if (!totalGain) {
            ui.notifications.warn("No option selected.");
            return data;
        }

        let current = await getSuperiorityValue(pool);
        await setSuperiorityValue(pool, current + totalGain);
        postDialogMessage("Gained", pool, totalGain);
        ui.notifications.info(`Gained ${totalGain} Superiority (${pool}).`);
        return data;
    }

    static async prompt({ pool, surprise, sizeUp, sizeUpPlus, victory, greaterVictory, winning, outmanoeuvre, woundedPride, custom } = {}) {
        return new Promise((resolve) => {
            new this({ pool, surprise, sizeUp, sizeUpPlus, victory, greaterVictory, winning, outmanoeuvre, woundedPride, custom }, { resolve }).render(true);
        });
    }
}

async function getSuperiorityValue(pool) {
    if (pool === "enemy") {
        return game.settings.get("impmal-community", "superiorityEnemy");
    }

    return game.settings.get("impmal", "superiority");
}

function getSuperiorityValueSync(pool) {
    if (pool === "enemy") {
        return game.settings.get("impmal-community", "superiorityEnemy");
    }

    return game.settings.get("impmal", "superiority");
}

async function setSuperiorityValue(pool, value) {
    if (pool === "enemy") {
        return game.settings.set("impmal-community", "superiorityEnemy", value);
    }

    return game.settings.set("impmal", "superiority", value);
}

function postDialogMessage(action, pool, amount) {
    let content = `${action} ${amount} ${getPoolLabel(pool)} Superiority.`;
    ui.notifications.info(content);
}

function overrideStaticSubmit(DialogClass) {
    if (!DialogClass?.submit || DialogClass._activeSuperioritySubmitWrapped) {
        return;
    }

    const originalStaticSubmit = DialogClass.submit;
    DialogClass.submit = function (ev) {
        if (!spendActiveSuperiority(this)) {
            return;
        }
        return originalStaticSubmit.call(this, ev);
    };

    if (DialogClass.DEFAULT_OPTIONS?.form) {
        DialogClass.DEFAULT_OPTIONS.form.handler = DialogClass.submit;
    } else {
        DialogClass.DEFAULT_OPTIONS = foundry.utils.mergeObject(DialogClass.DEFAULT_OPTIONS || {}, {
            form: {
                handler: DialogClass.submit
            }
        });
    }

    DialogClass._activeSuperioritySubmitWrapped = true;
}

function spendActiveSuperiority(dialog) {
    const requested = Number(dialog.fields.activeSuperiority || 0);
    if (!requested) {
        return true;
    }

    const pool = getActiveSuperiorityPool(dialog.actor);
    const available = getSuperiorityValueSync(pool);
    const cost = getActiveSuperiorityCost(dialog.actor, requested);
    if (available < cost) {
        ui.notifications.error(`Not enough Superiority in ${getPoolLabel(pool)} pool (${available} available, ${cost} needed).`);
        return false;
    }

    if (game.user.isGM) {
        setSuperiorityValue(pool, available - cost);
        postDialogMessage("Spent", pool, cost);
    } else {
        game.socket.emit(SOCKET_NAME, {
            type: "activeSuperioritySpend",
            payload: { pool, spend: cost }
        });
    }
    return true;
}

function getActiveSuperiorityPool(actor) {
    if (!actor) {
        return "enemy";
    }

    if (actor.hasPlayerOwner) {
        return "allied";
    }

    const disposition = actor?.token?.document?.disposition;
    if (disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) {
        return "allied";
    }

    return "enemy";
}

function getActiveSuperiorityLabel(actor) {
    return getPoolLabel(getActiveSuperiorityPool(actor));
}

function isActorInCombat(actor) {
    if (!actor) {
        return false;
    }

    if (actor.inCombat) {
        return true;
    }

    const combat = game.combat;
    if (!combat) {
        return false;
    }

    return combat.combatants?.some((combatant) => combatant?.actor?.id === actor.id);
}

function getPoolLabel(pool) {
    return pool === "enemy"
        ? game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityEnemy")
        : game.i18n.localize("IMPMAL_COMMUNITY.SuperiorityAllied");
}

function getActiveSuperiorityCost(actor, requested) {
    const discount = isActiveSuperiorityCheap(actor) ? 1 : 0;
    return Math.max(0, Number(requested || 0) - discount);
}

function isActiveSuperiorityCheap(actor) {
    return Boolean(actor?.system?.activeSuperiorityCheap || actor?.flags?.["impmal-community"]?.activeSuperiorityCheap);
}
