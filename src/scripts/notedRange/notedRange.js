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
    });
}