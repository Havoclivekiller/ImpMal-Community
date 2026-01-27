export function registerDeleteIniMessage() {
    Hooks.on("preCreateChatMessage", function (message) {
        return InitativeHandling.handleIniRoll(message);
    });
}

export class InitativeHandling {
    static moduleName = "impmal-community";

    static handleIniRoll(message) {
        if (game.settings.get(this.moduleName, "deleteIniMessage")) {
            if (message.flags.core?.initiativeRoll) {
                return false;
            }
        }
    }
}