
const old_computeRangeWeaponModel = WeaponModel.prototype.computeRange;

export function registerAdditionalRange() {
    WeaponModel.prototype.computeRange = new_computeRangeWeaponModel;

    Hooks.on('ready', () => {
        if (game.settings.get("impmal-community", "notedRange") === false)
        {
         const maxBeyond = Math.min(game.settings.get("impmal-community", "additionalRange"),20)+4;
        const additionalRanges = {};

        for (let i = 4; i <= maxBeyond; i++) {
            additionalRanges[`beyond${i}`] = game.i18n.format(
                "IMPMAL_COMMUNITY.additionalRange.beyondplus",
                { number: i }
            );
        }

        foundry.utils.mergeObject(IMPMAL.ranges, additionalRanges);

        foundry.utils.mergeObject(IMPMAL.powerRanges, {
            extreme: game.i18n.localize("IMPMAL.Extreme"),
            ...additionalRanges
        });
        }
    });
}

    function new_computeRangeWeaponModel()
    {
        //old_computeRangeWeaponModel.call(this, items);

        if (this.range)
        {
            let ranges = Object.keys(IMPMAL.ranges);
            let index = ranges.findIndex(i => i == this.range);
            index = Math.clamp(index + this.rangeModifier.value, 0, ranges.length - 1);
            this.range = ranges[index];
        }

        if (this.rangeModifier.override)
        {
            this.range = this.rangeModifier.override;
        }
    }