import { registerConstants } from "./constants.js";

import { registerActiveSuperiority } from "./activeSuperiority/activeSuperiority.js";
import { registerAlternativeInitiative } from "./alternativeInitiative/alternativeInitiative.js";
import { registerAlternativeMasterCrafted } from "./alternativeMasterCrafted/alternativeMasterCrafted.js";
import { registerAlternativeRend } from "./alternativeRend/alternativeRend.js";
import { registerAutoCritKillHandling } from "./autoCritHandling/autoCritHandling.js";
import { registerChangeConditionImages } from "./changeConditionImages/changeConditionImages.js";
import { registerDeleteIniMessage } from "./deleteIni/deleteIni.js";
import { registerDoublesEveryTest } from "./doublesEveryTest/doublesEveryTest.js";
import { registerPartySheet } from "./party-sheet/party-sheet.js";
import { registerPromptRoll } from "./promptRoll/promptRoll.js";
import { registerShootingMelee } from "./shootingMelee/shootingMelee.js";
import { registerTokenRuler } from "./tokenRuler/tokenRuler.js";

Hooks.on('init', () => {
    registerConstants();

    if (game.settings.get("impmal-community", "tokenRuler") === true) {
        registerTokenRuler();
    }

    if (game.settings.get("impmal-community", "alternativeInitiative") === true) {
        registerAlternativeInitiative();
    }

    if (game.settings.get("impmal-community", "alternativeMasterCrafted") === true) {
        registerAlternativeMasterCrafted();
    }

    if (game.settings.get("impmal-community", "alternativeRend") === true) {
        registerAlternativeRend();
    }

    if (game.settings.get("impmal-community", "changeConditionImages") === true) {
        registerChangeConditionImages();
    }

    if (game.settings.get("impmal-community", "activeSuperiority") === true) {
        registerActiveSuperiority();
    }

    if (game.settings.get("impmal-community", "shootingIntoMelee") === true) {
        registerShootingMelee();
    }

    if (game.settings.get("impmal-community", "computeDoublesAll") === true) {
        registerDoublesEveryTest();
    }

    if (game.settings.get("impmal-community", "autoCritKillNpcs") === true ||
        game.settings.get("impmal-community", "showNpcCrit") === true) {
        registerAutoCritKillHandling();
    }

    if (game.settings.get("impmal-community", "deleteIniMessage") === true) {
        registerDeleteIniMessage();
    }

    registerPartySheet();
    registerPromptRoll();
});