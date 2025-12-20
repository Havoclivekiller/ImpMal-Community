export function registerActiveSuperiority() {
    registerActiveSuperioritySettings();
    registerActiveSuperiorityResource();
    registerActiveSuperioritySpendDialog();
    registerActiveSuperiorityGainDialog();
    registerActiveSuperiorityHooks();
    registerActiveSuperiorityTestDialogContext();
}
function registerActiveSuperiorityTestDialogContext() {
    const original = TestDialog.prototype._prepareContext;
    TestDialog.prototype._prepareContext = async function (options) {
        this.advantage = 0;
        this.disadvantage = 0;

        const context = await original.call(this, options);

        context.advantage = this.advantage;
        context.disadvantage = this.disadvantage;
        this.fields.state = this.computeState();
        // context.showSuperiority = ...
        return context;
    };
}

function registerActiveSuperioritySettings() {
    game.settings.register("impmal-community", "superiorityEnemy", {
        name: "IMPMAL.SuperiorityEnemy",
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
            game.impmal.resources.registerResource("IMPMAL.SuperiorityEnemy", "impmal-community", "superiorityEnemy");
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

function registerActiveSuperiorityHooks() {
    let lastSuperiority = null;
    let lastSuperiorityEnemy = null;

    Hooks.on("ready", () => {
        lastSuperiority = game.settings.get("impmal", "superiority");
        lastSuperiorityEnemy = game.settings.get("impmal-community", "superiorityEnemy");
    });

    Hooks.on("impmal:superiorityChanged", (value) => {
        postSuperiorityMessage(game.i18n.localize("IMPMAL.SuperiorityAllied") + " " + game.i18n.localize("IMPMAL.Superiority"), value, lastSuperiority);
        lastSuperiority = value;
    });

    Hooks.on("impmal:superiorityEnemyChanged", (value) => {
        postSuperiorityMessage(game.i18n.localize("IMPMAL.SuperiorityEnemy") + " " + game.i18n.localize("IMPMAL.Superiority"), value, lastSuperiorityEnemy);
        lastSuperiorityEnemy = value;
    });
}

function postSuperiorityMessage(labelKey, value, previous) {
    if (!game.user.isGM) {
        return;
    }

    let label = labelKey;
    let previousText = Number.isFinite(previous) ? `${previous}` : "?";
    let content = `${label}: ${previousText} -> ${value}`;

    ChatMessage.create({
        content,
        speaker: { alias: label },
        whisper: ChatMessage.getWhisperRecipients('GM')
    });
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
            title: "IMPMAL.SuperioritySpend.Title"
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
        context.pool = this.data.pool || "allied";
        context.makeItCount = this.data.makeItCount ?? "0";
        context.additionalAction = this.data.additionalAction ?? false;
        context.littleBoost = this.data.littleBoost ?? false;
        context.fleeFromHarm = this.data.fleeFromHarm ?? false;
        context.breakDown = this.data.breakDown ?? false;
        context.custom = this.data.custom ?? 0;
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

        if (data.additionalAction) {
            totalCost += 4;
        }
        if (data.littleBoost) {
            totalCost += 1;
        }
        if (data.fleeFromHarm) {
            totalCost += 2;
        }
        if (data.breakDown) {
            totalCost += 5;
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
            title: "IMPMAL.SuperiorityGain.Title"
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
        context.pool = this.data.pool || "allied";
        context.surprise = this.data.surprise ?? false;
        context.sizeUp = this.data.sizeUp ?? false;
        context.sizeUpPlus = this.data.sizeUpPlus ?? false;
        context.victory = this.data.victory ?? false;
        context.greaterVictory = this.data.greaterVictory ?? false;
        context.winning = this.data.winning ?? false;
        context.outmanoeuvre = this.data.outmanoeuvre ?? false;
        context.woundedPride = this.data.woundedPride ?? false;
        context.custom = this.data.custom ?? 0;
        return context;
    }

    static async submit(event, form, formData) {
        let data = formData.object;
        let pool = data.pool || "allied";
        let totalGain = Number(data.custom || 0);

        if (data.surprise) {
            totalGain += 1;
        }
        if (data.sizeUp) {
            totalGain += 2;
        }
        if (data.sizeUpPlus) {
            totalGain += 3;
        }
        if (data.victory) {
            totalGain += 1;
        }
        if (data.greaterVictory) {
            totalGain += 2;
        }
        if (data.winning) {
            totalGain += 1;
        }
        if (data.outmanoeuvre) {
            totalGain += 1;
        }
        if (data.woundedPride) {
            totalGain += 1;
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

async function setSuperiorityValue(pool, value) {
    if (pool === "enemy") {
        return game.settings.set("impmal-community", "superiorityEnemy", value);
    }

    return game.settings.set("impmal", "superiority", value);
}

function postDialogMessage(action, pool, amount) {
    let poolLabel = pool === "enemy" ? "Enemy" : "Allied";
    let content = `${action} ${amount} ${poolLabel} Superiority.`;
    ChatMessage.create({
        content,
        speaker: { alias: "Superiority" }
    });
}
