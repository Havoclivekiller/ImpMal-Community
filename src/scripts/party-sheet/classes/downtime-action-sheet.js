export class DowntimeActionSheet extends IMItemSheet {

    static type = "impmal-community.downtimeAction"

    static DEFAULT_OPTIONS = foundry.utils.mergeObject({
        classes: [this.type],
        actions: {
            addDowntimeTest: this._onAddDowntimeTest,
            removeDowntimeTest: this._onRemoveDowntimeTest,
            assignDowntimeTestActor: this._onAssignDowntimeTestActor,
            makeDowntimeTest: this._onMakeDowntimeTest
        }
    }, super.DEFAULT_OPTIONS);

    static PARTS = {
        header: { scrollable: [""], template: 'systems/impmal/templates/item/item-header.hbs', classes: ["sheet-header"] },
        tabs: { scrollable: [""], template: 'templates/generic/tab-navigation.hbs' },
        description: { scrollable: [""], template: 'systems/impmal/templates/item/item-description.hbs' },
        details: { scrollable: [""], template: `modules/impmal-community/templates/party-sheet/downtime-action-details.hbs` },
        effects: { scrollable: [""], template: 'systems/impmal/templates/item/item-effects.hbs' },
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const tests = Array.from(this.item.system.tests || []);
        context.downtimeTests = tests.map((test) => ({
            ...test,
            displayLabel: this._formatTestLabel(test)
        }));
        return context;
    }

    async _onRender(options) {
        await super._onRender(options);
        const root = this._getRoot();
        if (!root) {
            return;
        }

        root.querySelectorAll("[data-test-index]").forEach((row) => {
            this._syncSkillRow(row);
        });

        root.querySelectorAll("[data-action='downtimeActionSkill']").forEach((element) => {
            element.onchange = this._onSkillChange.bind(this);
        });
        root.querySelectorAll("[data-action='downtimeActionCharacteristic']").forEach((element) => {
            element.onchange = this._onCharacteristicChange.bind(this);
        });
    }

    _formatTestLabel(test) {
        const difficulties = game.impmal.config.difficulties || {};
        const difficulty = difficulties[test.difficulty];
        const difficultyName = difficulty ? game.i18n.localize(difficulty.name) : test.difficulty;
        const modifierValue = Number(difficulty?.modifier ?? 0);
        const modifierLabel = modifierValue >= 0 ? `+${modifierValue}` : `${modifierValue}`;
        const difficultyLabel = `${difficultyName} (${modifierLabel})`;

        let targetLabel = "";
        if (test.characteristic) {
            targetLabel = game.impmal.config.characteristics?.[test.characteristic] || test.characteristic;
        }
        else if (test.skill?.key) {
            targetLabel = game.impmal.config.skills?.[test.skill.key] || test.skill.key;
        }

        let specializationLabel = "";
        if (test.skill?.specialisation) {
            specializationLabel = ` (${test.skill.specialisation})`;
        }

        const labelParts = [difficultyLabel, targetLabel + specializationLabel, "Test"].filter(Boolean);
        return labelParts.join(" ").trim();
    }

    _syncSkillRow(row) {
        const characteristic = row.querySelector("[data-action='downtimeActionCharacteristic']");
        const skillRow = row.querySelector("[data-downtime-action-skill-row]");
        const hasCharacteristic = Boolean(characteristic?.value);
        if (skillRow) {
            skillRow.style.display = hasCharacteristic ? "none" : "";
        }
    }

    _onSkillChange(event) {
        const row = event.currentTarget.closest("[data-test-index]");
        if (!row) {
            return;
        }
        if (!event.currentTarget.value) {
            return;
        }
        const characteristic = row.querySelector("[data-action='downtimeActionCharacteristic']");
        if (characteristic) {
            characteristic.value = "";
        }
        this._syncSkillRow(row);
    }

    _onCharacteristicChange(event) {
        const row = event.currentTarget.closest("[data-test-index]");
        if (!row) {
            return;
        }
        if (!event.currentTarget.value) {
            return;
        }
        const skill = row.querySelector("[data-action='downtimeActionSkill']");
        if (skill) {
            skill.value = "";
        }
        const specialisation = row.querySelector("[data-action='downtimeActionSpecialisation']");
        if (specialisation) {
            specialisation.value = "";
        }
        this._syncSkillRow(row);
    }

    _getRoot() {
        if (this.element instanceof HTMLElement) {
            return this.element;
        }
        if (this.element?.[0] instanceof HTMLElement) {
            return this.element[0];
        }
        return null;
    }

    static async _onAssignDowntimeTestActor(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index ?? target?.closest("[data-test-index]")?.dataset?.testIndex);
        if (!Number.isInteger(index)) {
            return;
        }
        const assignee = await this._promptAssignTestActor();
        if (!assignee) {
            return;
        }
        const path = `system.tests.${index}.assignee`;
        await this.item.update({ [path]: assignee });
    }

    static _onMakeDowntimeTest(event) {
        event.preventDefault();
    }

    static _onAddDowntimeTest(event) {
        event.preventDefault();
        const current = Array.from(this.item.system.tests || []);
        current.push(this.constructor._getDefaultTest());
        return this.item.update({ "system.tests": current });
    }

    static _onRemoveDowntimeTest(event, target) {
        event.preventDefault();
        const index = Number(target?.dataset?.index);
        if (!Number.isInteger(index)) {
            return;
        }
        const current = Array.from(this.item.system.tests || []);
        if (index < 0 || index >= current.length) {
            return;
        }
        current.splice(index, 1);
        return this.item.update({ "system.tests": current });
    }

    static _getDefaultTest() {
        return {
            characteristic: "",
            skill: {
                key: "",
                specialisation: ""
            },
            difficulty: "challenging",
            modifier: 0,
            slModifier: 0,
            state: "normal",
            assignee: {
                uuid: "",
                name: "",
                img: ""
            }
        };
    }

    async _promptAssignTestActor() {
        const lists = await this._getAssignableActors();
        const content = await foundry.applications.handlebars.renderTemplate(
            "modules/impmal-community/templates/party-sheet/assign-character.hbs",
            {
                ...lists,
                headerPlayer: "IMPMAL_COMMUNITY.DowntimeAction.PlayerCharacters",
                headerAllied: "IMPMAL_COMMUNITY.DowntimeAction.AlliedCharacters",
                labelUnassigned: "IMPMAL_COMMUNITY.DowntimeAction.NoCharacterAssigned"
            }
        );

        const response = await foundry.applications.api.DialogV2.wait({
            window: { title: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.AssignCharacter") },
            content,
            buttons: [
                {
                    action: "submit",
                    label: game.i18n.localize("IMPMAL_COMMUNITY.DowntimeAction.Assign"),
                    default: true,
                    callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object
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

        if (!response.assignee) {
            return { uuid: "", name: "", img: "" };
        }

        const entry = lists.all.find(item => item.uuid === response.assignee);
        if (!entry) {
            return null;
        }
        return {
            uuid: entry.uuid,
            name: entry.name,
            img: entry.img
        };
    }

    async _getAssignableActors() {
        const memberUuids = Array.from(this.item.actor?.system.partyMembers || []);
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
                isPlayerCharacter: userCharacters.has(member.uuid)
            }));

        const playerCharacters = resolvedMembers.filter(member => member.isPlayerCharacter);
        const alliedCharacters = resolvedMembers.filter(member => !member.isPlayerCharacter);

        return {
            playerCharacters,
            alliedCharacters,
            all: resolvedMembers
        };
    }
}
