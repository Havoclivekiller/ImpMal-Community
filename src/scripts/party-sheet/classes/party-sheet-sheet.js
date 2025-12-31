const MODULE_ID = "impmal-community";
const SOCKET_NAME = `module.${MODULE_ID}`;

export class PartySheet extends IMActorSheet {

    static DEFAULT_OPTIONS = {
        actions: {
            removePartyMember: this._onRemovePartyMember,
            openPartyMember: this._onOpenPartyMember,
            openPatron: this._onOpenPatron,
            clearPatron: this._onClearPatron,
            takeSolars: this._onTakeSolars,
            putSolars: this._onPutSolars,
            selectExtendedTest: this._onSelectExtendedTest,
            assignTestActor: this._onAssignTestActor,
            makeTest: this._onMakeTest,
            requestTest: this._onRequestTest,
            selectDowntimeAction: this._onSelectDowntimeAction,
            assignDowntimeTestActor: this._onAssignDowntimeTestActor,
            makeDowntimeTest: this._onMakeDowntimeTest,
            requestDowntimeTest: this._onRequestDowntimeTest,
            postReward: this._onPostReward,
            expandRow: this._onExpandRow,
        },
        position: {
            height: 900,
            width: 800
        }
    }

    static PARTS = {
        header: {
            scrollable: [''],
            template: 'modules/impmal-community/templates/party-sheet/party-sheet-header.hbs',
            classes: ['sheet-header']
        },
        tabs: { scrollable: [''], template: 'templates/generic/tab-navigation.hbs' },
        main: {
            scrollable: [''],
            template: 'modules/impmal-community/templates/party-sheet/party-sheet-main.hbs'
        },
        extendedTests: {
            scrollable: [''],
            template: 'modules/impmal-community/templates/party-sheet/party-sheet-extended.hbs'
        },
        downtimeActions: {
            scrollable: [''],
            template: 'modules/impmal-community/templates/party-sheet/party-sheet-downtime.hbs'
        },
        vault: {
            scrollable: [''],
            template: 'modules/impmal-community/templates/party-sheet/party-sheet-vault.hbs'
        }
    };

    static TABS = {
        main: {
            id: 'main',
            group: 'primary',
            label: 'IMPMAL_COMMUNITY.PartySheet.Name'
        },
        extendedTests: {
            id: 'extendedTests',
            group: 'primary',
            label: 'IMPMAL_COMMUNITY.PartySheet.ExtendedTests'
        },
        downtimeActions: {
            id: 'downtimeActions',
            group: 'primary',
            label: 'IMPMAL_COMMUNITY.PartySheet.DowntimeActions'
        },
        vault: {
            id: 'vault',
            group: 'primary',
            label: 'IMPMAL_COMMUNITY.PartySheet.Vault'
        }
    };

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.extendedTests = this.actor.items.filter(item => item.type === "impmal-community.extendedTest");
        context.currentExtendedTests = context.extendedTests.filter(item => {
            const acquired = Number(item.system.acquiredSL || 0);
            const total = Number(item.system.totalSL || 0);
            const tests = Array.from(item.system.tests || []);
            const requiredDone = tests.filter(test => test?.required).every(test => test?.done);
            return acquired < total || !requiredDone;
        });
        context.completedExtendedTests = context.extendedTests.filter(item => {
            const acquired = Number(item.system.acquiredSL || 0);
            const total = Number(item.system.totalSL || 0);
            const tests = Array.from(item.system.tests || []);
            const requiredDone = tests.filter(test => test?.required).every(test => test?.done);
            return acquired >= total && requiredDone;
        });

        const selectedUuid = this.actor.getFlag("impmal-community", "selectedExtendedTest")
            || context.currentExtendedTests[0]?.uuid
            || context.completedExtendedTests[0]?.uuid;
        context.selectedExtendedTestUuid = selectedUuid;
        const selectedTest = context.extendedTests.find(item => item.uuid === selectedUuid);
        if (selectedTest) {
            const summaryData = await selectedTest.system.summaryData();
            context.selectedExtendedTestHtml = await foundry.applications.handlebars.renderTemplate(
                "modules/impmal-community/templates/party-sheet/extended-test-summary.hbs",
                summaryData
            );
        }

        context.downtimeActions = this.actor.items.filter(item => item.type === "impmal-community.downtimeAction");
        const downtimeTypeLabels = {
            group: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.TypeOptions.Group"),
            individual: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.TypeOptions.Individual"),
            longTerm: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.TypeOptions.LongTerm"),
            custom: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.TypeOptions.Custom")
        };
        const knownTypeLabels = [
            downtimeTypeLabels.group,
            downtimeTypeLabels.individual,
            downtimeTypeLabels.longTerm
        ];
        const groupedDowntime = new Map();
        for (const item of context.downtimeActions) {
            const rawType = (item.system.downtimeType || "").trim();
            const rawLower = rawType.toLowerCase();
            const knownMatch = knownTypeLabels.find(label => label.toLowerCase() === rawLower);
            const label = knownMatch || rawType || downtimeTypeLabels.custom;
            if (!groupedDowntime.has(label)) {
                groupedDowntime.set(label, []);
            }
            groupedDowntime.get(label).push(item);
        }
        const customLabels = Array.from(groupedDowntime.keys())
            .filter(label => !knownTypeLabels.includes(label))
            .sort((a, b) => a.localeCompare(b));
        context.downtimeActionGroups = [
            ...knownTypeLabels,
            ...customLabels
        ]
            .filter(label => groupedDowntime.has(label))
            .map(label => ({
                label,
                items: groupedDowntime.get(label)
            }));
        const selectedDowntimeUuid = this.actor.getFlag("impmal-community", "selectedDowntimeAction")
            || context.downtimeActions[0]?.uuid;
        context.selectedDowntimeActionUuid = selectedDowntimeUuid;
        const selectedDowntime = context.downtimeActions.find(item => item.uuid === selectedDowntimeUuid);
        if (selectedDowntime) {
            const summaryData = await selectedDowntime.system.summaryData();
            context.selectedDowntimeActionHtml = await foundry.applications.handlebars.renderTemplate(
                "modules/impmal-community/templates/party-sheet/downtime-action-summary.hbs",
                summaryData
            );
        }
        const memberUuids = Array.from(this.actor.system.partyMembers || []);
        const members = await Promise.all(memberUuids.map(uuid => fromUuid(uuid)));
        const userCharacters = new Set(
            game.users
                .filter(user => user.character)
                .map(user => user.character.uuid)
        );
        const resolvedMembers = members
            .filter(member => member)
            .map(member => ({
                uuid: member.uuid,
                name: member.name,
                img: member.img,
                origin: member.system?.origin?.name || "",
                faction: member.system?.faction?.name || "",
                role: member.system?.role?.name || "",
                species: member.system?.details?.species || member.system?.species || "",
                isPlayerCharacter: userCharacters.has(member.uuid)
            }));
        context.playerCharacters = resolvedMembers.filter(member => member.isPlayerCharacter);
        context.alliedCharacters = resolvedMembers.filter(member => !member.isPlayerCharacter);

        const patronUuid = this.actor.system.patronRef;
        if (patronUuid) {
            const patron = await fromUuid(patronUuid);
            if (patron) {
                context.patron = {
                    uuid: patron.uuid,
                    name: patron.name,
                    img: patron.img,
                    faction: patron.system?.faction?.name || "",
                    duty: patron.system?.duty?.name || "",
                    motivation: patron.system?.motivation || "",
                    demeanor: patron.system?.demeanor || ""
                };
            }
        }

        return context;
    }

    static _onExpandRow(ev, target) {
        let dropdown = target.closest(".list-row").querySelector(".dropdown-content");
        if (dropdown.classList.contains("expanded")) {
            dropdown.classList.replace("expanded", "collapsed");
        }
        else if (dropdown.classList.contains("collapsed")) {
            dropdown.classList.replace("collapsed", "expanded");
        }
    }

    async _onDropActor(data, event) {
        let drop = await super._onDropActor(data, event);
        if (data?.type !== "Actor" || !data?.uuid) {
            return drop;
        }
        let actor = await fromUuid(data.uuid);
        if (!actor) {
            return drop;
        }
        if (actor.type === "patron") {
            await this.actor.update({ "system.patronRef": actor.uuid });
            return drop;
        }
        const current = Array.from(this.actor.system.partyMembers || []);
        if (!current.includes(actor.uuid)) {
            current.push(actor.uuid);
            await this.actor.update({ "system.partyMembers": current });
        }

        return drop;
    }

    async _onDropItem(data, ev) {
        super._onDropItem(data, ev);
    }

    static async _onAssignTestActor(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index ?? target?.closest("[data-test-index]")?.dataset?.testIndex);
        if (!Number.isInteger(index)) {
            return;
        }
        const document = this._getDocument(event);
        if (!document?.system?.assignTestActor) {
            return;
        }
        await document.system.assignTestActor(index, this.actor);
    }

    static async _onMakeTest(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index);
        if (!Number.isInteger(index)) {
            return;
        }
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        const document = await fromUuid(uuid);
        if (!document?.system?.tests?.[index]) {
            return;
        }
        const test = document.system.tests[index];
        if (!test?.characteristic && !test?.skill?.key) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.WarnNoTestTarget"));
            return;
        }
        const assigneeUuid = test?.assignee?.uuid;
        let actor = null;
        if (assigneeUuid) {
            const assigned = await fromUuid(assigneeUuid);
            if (assigned?.testUserPermission?.(game.user, "OWNER")) {
                actor = assigned;
            }
            else if (game.user?.isGM) {
                actor = assigned;
            }
        }

        if (!actor && game.user?.character) {
            actor = game.user.character;
        }

        if (!actor) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.WarnNoTestActor"));
            return;
        }

        await runExtendedTestOnClient(buildExtendedTestPayload(actor, test, {
            userId: ("userId" in game.user ? game.user.id : null),
            extendedName: document.name,
            extendedUuid: uuid,
            testId: index,
            partyUuid: this.id
        }));
    }

    static async _onRequestTest(event, target) {
        event.preventDefault();
        if (!game.user?.isGM) {
            return;
        }
        const index = Number(target?.dataset?.index);
        if (!Number.isInteger(index)) {
            return;
        }
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        const document = await fromUuid(uuid);
        const test = document?.system?.tests?.[index];
        if (!test?.characteristic && !test?.skill?.key) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.WarnNoTestTarget"));
            return;
        }
        const assigneeUuid = test?.assignee?.uuid;
        if (!assigneeUuid) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.WarnNoAssignee"));
            return;
        }
        const actor = await fromUuid(assigneeUuid);
        if (!actor) {
            return;
        }
        const recipients = game.users.filter(user =>
            user.active &&
            !user.isGM &&
            actor.testUserPermission?.(user, "OWNER")
        );

        if (!recipients.length) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.WarnNoRecipient"));
            return;
        }

        for (const user of recipients) {
            const payload = buildExtendedTestPayload(actor, test, {
                userId: user.id,
                extendedName: document.name,
                extendedUuid: uuid,
                testId: index,
                partyUuid: this.id
            });
            game.socket.emit(SOCKET_NAME, { type: "extendedTestRoll", payload });
        }
    }

    static async _onSelectExtendedTest(event, target) {
        event.preventDefault();
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        await this.actor.setFlag("impmal-community", "selectedExtendedTest", uuid);
        this.render();
    }

    static async _onAssignDowntimeTestActor(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index ?? target?.closest("[data-test-index]")?.dataset?.testIndex);
        if (!Number.isInteger(index)) {
            return;
        }
        const document = this._getDocument(event);
        if (!document?.system?.assignTestActor) {
            return;
        }
        await document.system.assignTestActor(index, this.actor);
    }

    static async _onMakeDowntimeTest(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index);
        if (!Number.isInteger(index)) {
            return;
        }
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        const document = await fromUuid(uuid);
        if (!document?.system?.tests?.[index]) {
            return;
        }
        const test = document.system.tests[index];
        if (!test.characteristic && !test.skill?.key) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.WarnNoTestTarget"));
            return;
        }
        const assigneeUuid = test?.assignee?.uuid;
        let actor = null;
        if (assigneeUuid) {
            const assigned = await fromUuid(assigneeUuid);
            if (assigned?.testUserPermission?.(game.user, "OWNER")) {
                actor = assigned;
            }
            else if (game.user?.isGM) {
                actor = assigned;
            }
        }

        if (!actor && game.user?.character) {
            actor = game.user.character;
        }

        if (!actor) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.WarnNoTestActor"));
            return;
        }

        await runDowntimeActionOnClient(buildDowntimeActionPayload(actor, test, {
            userId: ("userId" in game.user ? game.user.id : null),
            downtimeName: document.name,
            downtimeUuid: uuid,
            testId: index,
            partyUuid: this.id
        }));
    }

    static async _onRequestDowntimeTest(event, target) {
        event.preventDefault();
        if (!game.user?.isGM) {
            return;
        }
        const index = Number(target?.dataset?.index);
        if (!Number.isInteger(index)) {
            return;
        }
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        const document = await fromUuid(uuid);
        const test = document?.system?.tests?.[index];
        if (!test?.characteristic && !test?.skill?.key) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.WarnNoTestTarget"));
            return;
        }
        const assigneeUuid = test?.assignee?.uuid;
        if (!assigneeUuid) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.WarnNoAssignee"));
            return;
        }
        const actor = await fromUuid(assigneeUuid);
        if (!actor) {
            return;
        }
        const recipients = game.users.filter(user =>
            user.active &&
            !user.isGM &&
            actor.testUserPermission?.(user, "OWNER")
        );

        if (!recipients.length) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.WarnNoRecipient"));
            return;
        }

        for (const user of recipients) {
            const payload = buildDowntimeActionPayload(actor, test, {
                userId: user.id,
                downtimeName: document.name,
                downtimeUuid: uuid,
                testId: index,
                partyUuid: this.id
            });
            game.socket.emit(SOCKET_NAME, { type: "downtimeActionRoll", payload });
        }
    }

    static async _onSelectDowntimeAction(event, target) {
        event.preventDefault();
        const uuid = target?.dataset?.uuid ?? target?.closest("[data-uuid]")?.dataset?.uuid;
        if (!uuid) {
            return;
        }
        await this.actor.setFlag("impmal-community", "selectedDowntimeAction", uuid);
        this.render();
    }

    static async _onRemovePartyMember(ev, target) {
        ev.stopPropagation();
        const uuid = target.dataset.uuid;
        if (!uuid) {
            return;
        }
        const confirm = await foundry.applications.api.DialogV2.confirm({
            content: `<p>${game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.RemoveCharacterConfirm")}</p>`
        });
        if (!confirm) {
            return;
        }
        const current = Array.from(this.actor.system.partyMembers || []);
        const next = current.filter(entry => entry !== uuid);
        await this.actor.update({ "system.partyMembers": next });
    }

    static async _onOpenPartyMember(ev, target) {
        const uuid = target.dataset.uuid;
        if (!uuid) {
            return;
        }
        const actor = await fromUuid(uuid);
        actor?.sheet?.render(true);
    }

    static async _onOpenPatron(ev, target) {
        const uuid = target.dataset.uuid;
        if (!uuid) {
            return;
        }
        const actor = await fromUuid(uuid);
        actor?.sheet?.render(true);
    }

    static async _onClearPatron(ev, target) {
        ev.stopPropagation();
        const confirm = await foundry.applications.api.DialogV2.confirm({
            content: `<p>${game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.RemovePatronConfirm")}</p>`
        });
        if (!confirm) {
            return;
        }
        await this.actor.update({ "system.patronRef": null });
    }

    static async _onPostReward(ev, target) {
        const patronUuid = this.actor.system.patronRef;
        if (patronUuid) {
            const patron = await fromUuid(patronUuid);
            let defaultPay = patron.system.payment.value;

            let reward = await RewardDialog.prompt({ solars: defaultPay, reason: `Payment from ${patron.name}` });
            reward.patron = patron;

            RewardMessageModel.postReward(reward);
        }
    }

    static async _onTakeSolars() {
        const userCharacter = game.user?.character;
        if (!userCharacter && !game.user?.isGM) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.WarnNeedCharacterTake"));
            return;
        }

        const amount = await this.constructor._promptSolarsAmount(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.TakeSolars"));
        if (!amount) {
            return;
        }

        const partySolars = Number(this.actor.system.solars) || 0;
        if (amount > partySolars) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.WarnNotEnoughPartySolars"));
            return;
        }

        await this.actor.update({ "system.solars": partySolars - amount });

        if (!userCharacter && game.user?.isGM) {
            ChatMessage.create({
                content: `<p>${game.i18n.format("IMPMAL_COMMUNITY.PartySheet.ChatGmTookSolars", { amount })}</p>`
            });
            return;
        }

        const characterSolars = Number(userCharacter.system.solars) || 0;
        await userCharacter.update({ "system.solars": characterSolars + amount });
        ChatMessage.create({
            content: `<p>${game.i18n.format("IMPMAL_COMMUNITY.PartySheet.ChatUserTookSolars", {
                user: game.user.name,
                character: userCharacter.name,
                amount
            })}</p>`
        });
    }

    static async _onPutSolars() {
        const userCharacter = game.user?.character;
        if (!userCharacter && !game.user?.isGM) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.WarnNeedCharacterPut"));
            return;
        }

        const amount = await this.constructor._promptSolarsAmount(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.PutSolars"));
        if (!amount) {
            return;
        }

        if (userCharacter) {
            const characterSolars = Number(userCharacter.system.solars) || 0;
            if (amount > characterSolars) {
                ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.WarnNotEnoughCharacterSolars"));
                return;
            }
            await userCharacter.update({ "system.solars": characterSolars - amount });
        }

        const partySolars = Number(this.actor.system.solars) || 0;
        await this.actor.update({ "system.solars": partySolars + amount });

        if (!userCharacter && game.user?.isGM) {
            ChatMessage.create({
                content: `<p>${game.i18n.format("IMPMAL_COMMUNITY.PartySheet.ChatGmPutSolars", { amount })}</p>`
            });
            return;
        }

        ChatMessage.create({
            content: `<p>${game.i18n.format("IMPMAL_COMMUNITY.PartySheet.ChatUserPutSolars", {
                user: game.user.name,
                character: userCharacter.name,
                amount
            })}</p>`
        });
    }

    static async _promptSolarsAmount(title) {
        const response = await foundry.applications.api.DialogV2.wait({
            window: { title },
            content: `
                <form>
                    <div class="form-group">
                        <label>${game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.Amount")}</label>
                        <div class="form-fields">
                            <input type="number" name="amount" min="1" step="1" value="1">
                        </div>
                    </div>
                </form>
            `,
            buttons: [
                {
                    action: "submit",
                    label: game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.Submit"),
                    default: true,
                    callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form).object
                },
                {
                    action: "cancel",
                    label: game.i18n.localize("Cancel"),
                    callback: () => false
                }
            ]
        });

        if (!response) {
            return null;
        }
        const amount = Number(response.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.PartySheet.WarnInvalidSolars"));
            return null;
        }
        return Math.floor(amount);
    }
}

function buildExtendedTestPayload(actor, test, options = {}) {
    return {
        actorId: actor.id,
        actorUuid: actor.uuid,
        userId: options.userId ?? null,
        characteristic: test.characteristic || "",
        skill: test.skill?.key || "",
        specialisation: test.skill?.specialisation || "",
        difficulty: test.difficulty || "challenging",
        modifier: Number(test.modifier || 0),
        sl: Number(test.slModifier || 0),
        state: test.state || "normal",
        testname: options.extendedName || "",
        extendedUuid: options.extendedUuid || "",
        testId: options.testId || 0,
        partyUuid: options.partyUuid || ""
    };
}

function buildDowntimeActionPayload(actor, test, options = {}) {
    return {
        actorId: actor.id,
        actorUuid: actor.uuid,
        userId: options.userId ?? null,
        characteristic: test.characteristic || "",
        skill: test.skill?.key || "",
        specialisation: test.skill?.specialisation || "",
        difficulty: test.difficulty || "challenging",
        modifier: Number(test.modifier || 0),
        sl: Number(test.slModifier || 0),
        state: test.state || "normal",
        testname: options.downtimeName || "",
        downtimeUuid: options.downtimeUuid || "",
        testId: options.testId || 0,
        partyUuid: options.partyUuid || ""
    };
}

async function runExtendedTestOnClient(payload) {
    if (payload.userId && payload.userId !== game.user.id) {
        return;
    }

    let actor = game.actors.get(payload.actorId);
    if (!actor && payload.actorUuid) {
        actor = await fromUuid(payload.actorUuid);
    }
    if (!actor) {
        return;
    }

    const fields = {
        difficulty: payload.difficulty,
        modifier: payload.modifier,
        SL: payload.sl,
        extendedTests: {
            extendedUuid: payload.extendedUuid,
            testId: payload.testId,
            partyUuid: payload.partyUuid
        }
    };

    if (payload.state === "advantage") {
        fields.advantage = 1;
    }
    else if (payload.state === "disadvantage") {
        fields.disadvantage = 1;
    }
    let tags =
    {
        extended: game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.Extended")
    }

    if (payload.characteristic) {
        actor.setupCharacteristicTest(payload.characteristic, { tags, fields, appendTitle: ` ${game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.Extended")} (${payload.testname})` });
        return;
    }

    const testData = { key: payload.skill };
    if (payload.specialisation) {
        testData.name = payload.specialisation;
    }

    actor.setupSkillTest(testData, { tags, fields, appendTitle: ` ${game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.Extended")} (${payload.testname})` });
}

async function runDowntimeActionOnClient(payload) {
    if (payload.userId && payload.userId !== game.user.id) {
        return;
    }

    let actor = game.actors.get(payload.actorId);
    if (!actor && payload.actorUuid) {
        actor = await fromUuid(payload.actorUuid);
    }
    if (!actor) {
        return;
    }

    const fields = {
        difficulty: payload.difficulty,
        modifier: payload.modifier,
        SL: payload.sl,
        downtimeActions: {
            downtimeUuid: payload.downtimeUuid,
            testId: payload.testId,
            partyUuid: payload.partyUuid
        }
    };

    if (payload.state === "advantage") {
        fields.advantage = 1;
    }
    else if (payload.state === "disadvantage") {
        fields.disadvantage = 1;
    }
    let tags =
    {
        downtime: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.FullLabel")
    }

    if (payload.characteristic) {
        actor.setupCharacteristicTest(payload.characteristic, { tags, fields, appendTitle: ` - ${game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.FullLabel")} (${payload.testname})` });
        return;
    }

    const testData = { key: payload.skill };
    if (payload.specialisation) {
        testData.name = payload.specialisation;
    }

    actor.setupSkillTest(testData, { tags, fields, appendTitle: ` - ${game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.FullLabel")} (${payload.testname})` });
}

Hooks.on("ready", () => {
    game.socket.on(SOCKET_NAME, (data) => {
        if (!data)
            return;
        if (data.type === "extendedTestRoll")
            runExtendedTestOnClient(data.payload);
        if (data.type === "downtimeActionRoll")
            runDowntimeActionOnClient(data.payload);
    });
});

Hooks.on("createChatMessage", async (message) => {
    if (message.type !== "test") {
        return;
    }

    const downtimeData = message.system?.context?.fields?.downtimeActions;
    if (downtimeData) {

        const downtimeUuid = downtimeData.downtimeUuid;
        const item = await fromUuid(downtimeUuid);
        if (!item) {
            return;
        }

        let args = {
            message,
            item,
            downtimeData
        }

        await Promise.all(item.parent.runScripts("postDowntimeAction", args)); 

        return;
    }

    const extendedData = message.system?.context?.fields?.extendedTests;
    if (!extendedData) {
        return;
    }

    const extendedUuid = extendedData.extendedUuid;
    const testId = Number(extendedData.testId);
    if (!extendedUuid || !Number.isInteger(testId)) {
        return;
    }

    const item = await fromUuid(extendedUuid);
    if (!item?.system?.tests) {
        return;
    }
    const tests = Array.isArray(item.system.tests) ? item.system.tests : [];
    if (testId < 0 || testId >= tests.length) {
        return;
    }

    const sl = Number(message.system?.result?.SL);
    if (!Number.isFinite(sl) || sl == 0) {
        return;
    }

    const test = tests[testId] || {};
    let delta = sl;
    if (delta < 0 && !test.countNegativeSL) {
        return;
    }

    const roll = Number(message.system?.result?.roll);
    const isDouble = Number.isFinite(roll) && ((roll % 11 === 0) || roll === 100);
    const outcome = message.system?.result?.outcome;
    const isSuccess = outcome === "success";
    const isCritical = isDouble && isSuccess;
    const isFumble = isDouble && !isSuccess;

    if (isCritical && test.criticalDoubleSL && delta > 0) {
        delta *= 2;
    }
    if (isFumble && test.fumbleDoubleSL && delta < 0) {
        delta *= 2;
    }

    const updates = {};
    const current = Number(item.system.acquiredSL || 0);
    if (delta !== 0) {
        updates["system.acquiredSL"] = current + delta;
    }
    if (isSuccess && !test.done) {
        const nextTests = foundry.utils.deepClone(tests);
        nextTests[testId] = foundry.utils.mergeObject(nextTests[testId] || {}, { done: true }, { inplace: false });
        updates["system.tests"] = nextTests;
    }

    if (!Object.keys(updates).length) {
        return;
    }
    await item.update(updates);

    let doneStr = "";
    const acquired = Number(item.system.acquiredSL || 0);
    const total = Number(item.system.totalSL || 0);
    const requiredDone = tests.filter(test => test?.required).every(test => test?.done);
    if (acquired >= total && requiredDone) {
        doneStr += `<p>${game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.CompletedMessage")}</p>`
    }

    let extendedName = item.name;

    ChatMessage.create({
        content: `<p>${game.i18n.format("IMPMAL_COMMUNITY.ExtendedTest.ProgressMessage", { extendedName, current, acquired, total })}</p>` + doneStr
    });

    let args = {
        message,
        item,
        extendedData
    }

    await Promise.all(item.parent.runScripts("postExtendedTest", args)); 

});
