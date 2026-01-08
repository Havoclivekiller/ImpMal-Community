export class DowntimeActionModel extends StandardItemModel {

    static defineSchema() {
        const fields = foundry.data.fields;
        let schema = super.defineSchema();
        schema.acquiredSL = new fields.NumberField({ initial: 0 });
        schema.downtimeType = new fields.StringField({ initial: "" });
        schema.tests = new fields.ArrayField(new fields.SchemaField({
            characteristic: new fields.StringField({ initial: "" }),
            skill: new fields.SchemaField({
                key: new fields.StringField({ initial: "" }),
                specialisation: new fields.StringField({ initial: "" })
            }),
            difficulty: new fields.StringField({ initial: "challenging" }),
            modifier: new fields.NumberField({ initial: 0 }),
            slModifier: new fields.NumberField({ initial: 0 }),
            state: new fields.StringField({ initial: "normal" }),
            assignee: new fields.SchemaField({
                uuid: new fields.StringField({ initial: "" }),
                name: new fields.StringField({ initial: "" }),
                img: new fields.StringField({ initial: "" })
            })
        }));
        return schema;
    }

    async summaryData() {
        let data = await super.summaryData();
        data.uuid = this.parent?.uuid || "";
        data.name = this.parent?.name || "";
        data.acquiredSL = Number(this.acquiredSL || 0);
        data.downtimeType = this.downtimeType || "";
        const difficulties = game.impmal?.config?.difficulties || {};
        const characteristics = game.impmal?.config?.characteristics || {};
        const skills = game.impmal?.config?.skills || {};

        data.tests = (this.tests || []).map((test, index) => {
            const difficulty = difficulties[test.difficulty];
            const difficultyName = difficulty ? game.i18n.localize(difficulty.name) : (test.difficulty || "");
            const modifierValue = Number(difficulty?.modifier ?? 0);
            const modifierLabel = modifierValue >= 0 ? `+${modifierValue}` : `${modifierValue}`;
            const difficultyLabel = difficultyName ? `${difficultyName} (${modifierLabel})` : "";

            let targetLabel = "";
            if (test.characteristic) {
                targetLabel = characteristics[test.characteristic] || test.characteristic;
            }
            else if (test.skill?.key) {
                targetLabel = skills[test.skill.key] || test.skill.key;
            }

            let specializationLabel = "";
            if (test.skill?.specialisation) {
                specializationLabel = ` (${test.skill.specialisation})`;
            }

            const labelParts = [difficultyLabel, targetLabel + specializationLabel, "Test"].filter(Boolean);
            const stateKey = test.state || "normal";
            const stateLabelMap = {
                advantage: game.i18n.localize("IMPMAL.Advantage"),
                normal: game.i18n.localize("IMPMAL.Normal"),
                disadvantage: game.i18n.localize("IMPMAL.Disadvantage")
            };
            const modifier = Number(test.modifier || 0);
            const slModifier = Number(test.slModifier || 0);
            const assignee = test.assignee || {};
            return {
                index,
                label: labelParts.join(" ").trim(),
                difficulty: difficultyLabel,
                modifier,
                slModifier,
                state: stateKey,
                stateLabel: stateLabelMap[stateKey] || stateKey,
                showModifier: modifier !== 0,
                showSlModifier: slModifier !== 0,
                showState: stateKey !== "normal",
                assignee: {
                    uuid: assignee.uuid || "",
                    name: assignee.name || "",
                    img: assignee.img || ""
                }
            };
        });
        return data;
    }

    async assignTestActor(index, actor) {
        if (!actor) {
            return;
        }
        if (!Number.isInteger(index)) {
            return;
        }
        const assignee = await this.constructor._promptAssignTestActor(actor);
        if (!assignee) {
            return;
        }
        const tests = foundry.utils.deepClone(this.tests || []);
        if (!Array.isArray(tests) || index < 0 || index >= tests.length) {
            return;
        }
        tests[index] = foundry.utils.mergeObject(tests[index] || {}, { assignee }, { inplace: false });
        await this.parent.update({ "system.tests": tests });
    }

    static async _promptAssignTestActor(actor) {
        if (!actor) {
            return null;
        }
        const lists = await this._getAssignableActors(actor);
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

    static async _getAssignableActors(actor) {
        const memberUuids = Array.from(actor.system.partyMembers || []);
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

    async _preCreate(data, options, user) {
        let allowed = await super._preCreate(data, options, user);
        if (allowed == false) {
            return allowed;
        }
        data.img = "systems/impmal/assets/icons/d10.webp";
        this.parent.updateSource({ "img": "systems/impmal/assets/icons/d10.webp" })
    }
}
