export function registerShootingMelee() {
    registerDialogTemplate();
    registerDialogField();
    registerTestLogic();
}

function registerDialogTemplate() {
    insertDialogPart(WeaponTestDialog, "shootingMelee", {
        template: "modules/impmal-community/templates/attack-fields.hbs",
        fields: true
    }, ["activeSuperiority", "state"]);
}

function registerDialogField() {
    const originalDefaultFields = AttackDialog.prototype._defaultFields;
    AttackDialog.prototype._defaultFields = function () {
        const fields = originalDefaultFields.call(this);
        fields.shootingIntoMeleeTargets = Number(fields.shootingIntoMeleeTargets || 0);
        return fields;
    };

    const originalComputeFields = AttackDialog.prototype.computeFields;
    AttackDialog.prototype.computeFields = function () {
        const result = originalComputeFields.call(this);
        if (this?.data?.skill == "ranged") {
            const targets = Math.max(0, Number(this.fields.shootingIntoMeleeTargets || 0));
            if (targets) {
                this.fields.SL -= targets;
                this.tooltips.add("SL", -targets, game.i18n.localize("IMPMAL_COMMUNITY.ShootingMelee.Name"));
            }
        }
        return result;
    };
}

function registerTestLogic() {
    const getter = findGetter(AttackTest.prototype, "tags");
    if (!getter) {
        return;
    }

    Object.defineProperty(AttackTest.prototype, "tags", {
        get() {
            const tags = getter.call(this) || [];
            const targets = Math.max(0, Number(this.data?.shootingIntoMeleeTargets || 0));
            if (targets && this.failed) {
                if (Number(this.result?.SL) >= -targets) {
                    tags.push(game.i18n.localize("IMPMAL_COMMUNITY.ShootingMelee.Wrong"));
                }
            }
            return tags;
        },
        configurable: true
    });

    const originalGetDialogTestData = AttackTest._getDialogTestData;
    AttackTest._getDialogTestData = function (data) {
        const testData = originalGetDialogTestData.call(this, data);
        testData.shootingIntoMeleeTargets = Math.max(0, Number(data.shootingIntoMeleeTargets || 0));
        return testData;
    };
}

function findGetter(proto, property) {
    let current = proto;
    while (current && current !== Object.prototype) {
        const desc = Object.getOwnPropertyDescriptor(current, property);
        if (desc?.get) {
            return desc.get;
        }
        current = Object.getPrototypeOf(current);
    }
    return null;
}

function insertDialogPart(DialogClass, partKey, partValue, beforeKeys = []) {
    if (!DialogClass?.PARTS || DialogClass.PARTS[partKey]) {
        return;
    }

    const nextParts = {};
    let inserted = false;
    for (const [key, value] of Object.entries(DialogClass.PARTS)) {
        if (!inserted && beforeKeys.includes(key)) {
            nextParts[partKey] = partValue;
            inserted = true;
        }
        nextParts[key] = value;
    }

    if (!inserted) {
        nextParts[partKey] = partValue;
    }

    DialogClass.PARTS = nextParts;
}
