export function registerAlternativeInitiative() {
    CONFIG.Combat.initiative = {
        formula: game.settings.get("impmal-community", "alternativeInitiativeFormula"),
    };
}
