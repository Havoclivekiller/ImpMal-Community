export function registerActiveSuperiority() {
    registerActiveSuperioritySettings();
    registerActiveSuperiorityResource();
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
