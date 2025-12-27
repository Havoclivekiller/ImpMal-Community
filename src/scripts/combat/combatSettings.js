export default class CombatSettings {
    static moduleName = 'impmal-community';

    static addCombatSetting() {
        game.settings.register(this.moduleName, 'autoCritKillNpcs', {
            name: game.i18n.localize('IMPMAL_COMMUNITY.combat.autoCritKillNpcs.name'),
            hint: game.i18n.localize('IMPMAL_COMMUNITY.combat.autoCritKillNpcs.hint'),
            scope: 'world',
            config: true,
            type: Boolean
        });

        game.settings.register(this.moduleName, 'showNpcCrit', {
            name: game.i18n.localize('IMPMAL_COMMUNITY.combat.showNpcCrit.name'),
            hint: game.i18n.localize('IMPMAL_COMMUNITY.combat.showNpcCrit.hint'),
            scope: 'world',
            config: true,
            type: Boolean
        });

        game.settings.register(this.moduleName, 'deleteIniMessage', {
            name: game.i18n.localize('IMPMAL_COMMUNITY.combat.deleteIniMessage.name'),
            hint: game.i18n.localize('IMPMAL_COMMUNITY.combat.deleteIniMessage.hint'),
            scope: 'world',
            config: true,
            type: Boolean
        });
    }
}
