import { PartySheet } from "./classes/party-sheet-sheet.js";
import { PartyModel } from "./classes/party-sheet-model.js";
import { ExtendedTestModel } from "./classes/extended-test-model.js";
import { ExtendedTestSheet } from "./classes/extended-test-sheet.js";
import { DowntimeActionModel } from "./classes/downtime-action-model.js";
import { DowntimeActionSheet } from "./classes/downtime-action-sheet.js";

export const registerPartySheet = () => {

    foundry.documents.collections.Actors.registerSheet('impmal-community', PartySheet, {
        types: ['impmal-community.partySheet'],
        makeDefault: true, label: "Party Sheet"
    });

    foundry.documents.collections.Items.registerSheet('impmal-community', ExtendedTestSheet, {
        types: ['impmal-community.extendedTest'],
        makeDefault: true, label: "Party Sheet"
    });

    foundry.documents.collections.Items.registerSheet('impmal-community', DowntimeActionSheet, {
        types: ['impmal-community.downtimeAction'],
        makeDefault: true, label: "Party Sheet"
    });

    Object.assign(CONFIG.Actor.dataModels, {
        'impmal-community.partySheet': PartyModel
    });

    Object.assign(CONFIG.Item.dataModels, {
        'impmal-community.extendedTest': ExtendedTestModel,
        'impmal-community.downtimeAction': DowntimeActionModel
    });


    foundry.utils.mergeObject(IMPMAL.scriptTriggers, {
        postExtendedTest: "IMPMAL_COMMUNITY.ExtendedTest.postExtendedTest",
        postDowntimeAction: "IMPMAL_COMMUNITY.DowntimeAction.postDowntimeAction",
    })

    foundry.utils.mergeObject(IMPMAL.asyncTriggers, {
        postExtendedTest: true,
        postDowntimeAction: true,
    })

};
