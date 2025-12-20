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
        Hooks.once("ready", register); export function registerActiveSuperiority() {
            registerActiveSuperioritySettings();
            registerActiveSuperiorityResource();
            registerActiveSuperiorityHooks();
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

        function registerActiveSuperiorityHooks() {
            let lastSuperiority = null;
            let lastSuperiorityEnemy = null;

            Hooks.on("ready", () => {
                lastSuperiority = game.settings.get("impmal", "superiority");
                lastSuperiorityEnemy = game.settings.get("impmal-community", "superiorityEnemy");
            });

            Hooks.on("impmal:superiorityChanged", (value) => {
                postSuperiorityMessage("Allied " + game.i18n.localize("IMPMAL.Superiority"), value, lastSuperiority);
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
                speaker: { alias: label }
            });
        }

    }
}
