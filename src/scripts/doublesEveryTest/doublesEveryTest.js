export function registerDoublesEveryTest() {

    let baseTestGetTags = Object.getOwnPropertyDescriptor(
        BaseTest.prototype,
        "tags"
    );

    Object.defineProperty(BaseTest.prototype, "tags", {
        get() {
            let tags = baseTestGetTags.get.call(this);

            let doNotAdd = tags.some(str => str.includes(game.i18n.localize("IMPMAL.Critical")))
                || tags.some(str => str.includes(game.i18n.localize("IMPMAL.Fumble")));
            if (!doNotAdd) {
                let isDoubles = this.result.roll % 11 == 0 || this.result.roll == 100;

                if (isDoubles && this.result.outcome === "success") {
                    tags.push(game.i18n.localize("IMPMAL.Critical"));
                }
                else if (isDoubles && this.result.outcome === "failure") {
                    tags.push(game.i18n.localize("IMPMAL.Fumble"));
                }
            }

            return tags;
        },
        configurable: true,
    });

    let powerTestGetTags = Object.getOwnPropertyDescriptor(
        PowerTest.prototype,
        "tags"
    );

    Object.defineProperty(PowerTest.prototype, "tags", {
        get() {
            let tags = powerTestGetTags.get.call(this);

            if (tags.some(str => str.includes(game.i18n.localize("IMPMAL.Critical")))) {
                tags.splice(tags.findIndex(s => s.includes("Critical")), 1);
            }
            if (tags.some(str => str.includes(game.i18n.localize("IMPMAL.Fumble")))) {
                tags.splice(tags.findIndex(s => s.includes("Fumble")), 1);
            }

            return tags;
        },
        configurable: true,
    });

    let attackTestGetTags = Object.getOwnPropertyDescriptor(
        AttackTest.prototype,
        "tags"
    );

    Object.defineProperty(AttackTest.prototype, "tags", {
        get() {
            let tags = attackTestGetTags.get.call(this);

            if (tags.some(str => str.includes(game.i18n.localize("IMPMAL.Fumble")))) {
                tags.splice(tags.findIndex(s => s.includes("Fumble")), 1);
            }

            return tags;
        },
        configurable: true,
    });
}