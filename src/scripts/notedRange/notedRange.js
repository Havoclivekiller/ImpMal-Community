export function registerNotedRange() {
    Hooks.on('ready', () => {
        IMPMAL.ranges = {
            short: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.short"),
            medium: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.medium"),
            long: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.long"),
            extreme: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.extreme"),
        }

        IMPMAL.powerRanges = {
            special: game.i18n.localize("IMPMAL.Special"),
            self: game.i18n.localize("IMPMAL.Self"),
            immediate: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.immediate"),
            short: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.short"),
            medium: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.medium"),
            long: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.long")
        }

       if (game.settings.get("impmal-community", "additionalRange") > 0) {
            const maxBeyond = Math.min(game.settings.get("impmal-community", "additionalRange"),20)+4;
            const baseDistance = 72;
            const distanceIncrement = 36;
            const additionalRanges = {};

            for (let i = 4; i <= maxBeyond; i++) {
                const distance = baseDistance + (i - 3) * distanceIncrement;

                additionalRanges[`beyond${i}`] = game.i18n.format(
                    "IMPMAL_COMMUNITY.notedRange.Ranges.beyondTemplate",
                    { number: i, distance: distance }
                );
            }

            foundry.utils.mergeObject(IMPMAL.ranges, additionalRanges);

            foundry.utils.mergeObject(IMPMAL.powerRanges, {
                extreme: game.i18n.localize("IMPMAL_COMMUNITY.notedRange.Ranges.extreme"),
                ...additionalRanges
            });
        }
    });
}