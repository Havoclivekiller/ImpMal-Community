const MODULE_ID = "impmal-community";
const SOCKET_NAME = `module.${MODULE_ID}`;

class PromptRollDialog extends WHFormApplication {
    static DEFAULT_OPTIONS = {
        id: "impmal-community-prompt-roll",
        classes: ["impmal", "warhammer", "prompt-roll"],
        tag: "form",
        form: {
            handler: this.submit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        window: {
            title: "IMPMAL_COMMUNITY.Prompter.Name",
            contentClasses: ["standard-form"],
            resizable: true
        },
        position: {
            width: 700
        }
    };

    static PARTS = {
        form: {
            template: "modules/impmal-community/templates/prompt-roll-dialog.hbs",
            scrollable: [".prompt-roll-body"]
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    async _preparePartContext(partId, context) {
        const partContext = await super._preparePartContext(partId, context);
        if (partId === "footer") {
            partContext.buttons = [{
                type: "submit",
                label: game.i18n.localize("IMPMAL_COMMUNITY.Prompter.PromptPlayers")
            }];
        }
        return partContext;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const selectedCharacteristic = this.selectedCharacteristic || "";
        const selectedSkill = this.selectedSkill || Object.keys(game.impmal.config.skills || {})[0] || "";
        const selectedDifficulty = this.selectedDifficulty || "challenging";
        const characteristics = this._getCharacteristics(selectedCharacteristic);
        const skills = this._getSkills(selectedSkill);
        const difficulties = this._getDifficulties(selectedDifficulty);
        const specialisations = await this._getSpecialisations(selectedSkill);

        context.characteristics = characteristics;
        context.skills = skills;
        context.difficulties = difficulties;
        context.specialisations = specialisations;
        context.selectedSkill = selectedSkill;
        context.selectedDifficulty = selectedDifficulty;
        context.promptAll = this.promptAll ?? true;
        context.actors = this._getEligibleActors();
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _onRender(options) {
        await super._onRender(options);
        const root = this._getRoot();
        if (!root) {
            return;
        }
        const promptAll = root.querySelector("[name='promptAll']");
        if (promptAll) {
            promptAll.onchange = this._onPromptAllChange.bind(this);
        }
        const skill = root.querySelector("[name='skill']");
        if (skill) {
            skill.onchange = this._onSkillChange.bind(this);
        }
        const difficulty = root.querySelector("[name='difficulty']");
        if (difficulty) {
            difficulty.onchange = this._onDifficultyChange.bind(this);
        }
        const characteristic = root.querySelector("[name='characteristic']");
        if (characteristic) {
            characteristic.onchange = this._onCharacteristicChange.bind(this);
        }
        this._syncCharacteristicState();
    }

    _getCharacteristics(selectedCharacteristic) {
        return Object.entries(game.impmal.config.characteristics || {})
            .map(([key, label]) => ({ key, label, selected: key === selectedCharacteristic }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    _getSkills(selectedSkill) {
        return Object.entries(game.impmal.config.skills || {})
            .map(([key, label]) => ({ key, label, selected: key === selectedSkill }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }

    _getDifficulties(selectedDifficulty) {
        return Object.entries(game.impmal.config.difficulties || {}).map(([key, data]) => {
            const label = game.i18n.localize(data.name);
            const modifier = Number(data.modifier ?? 0);
            const modifierLabel = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            return {
                key,
                label,
                display: `${label} ${modifierLabel}`.trim(),
                selected: key === selectedDifficulty
            };
        });
    }

    _getEligibleActors() {
        const actors = this._getUserCharacters();
        return actors
            .map(({ actor, owners }) => ({
                uuid: actor.uuid,
                id: actor.id,
                name: actor.name,
                owners: owners.map(user => user.name).join(", "),
                img: actor.img
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    _getUserCharacters() {
        return game.users
            .filter(user => user.active && !user.isGM && user.character)
            .map(user => {
                return { actor: user.character, owners: [user] };
            });
    }

    async _getSpecialisations(skillKey) {
        let systemSpecs = await this._getSystemSpecialisations(skillKey);
        let actorSpecs = await this._getActorSpecialisations(skillKey);

        let allSpecs = systemSpecs.concat(
            //filter system specs in actor sheets
            actorSpecs.filter(spec => !systemSpecs.map(item => item.name).includes(spec.name))
        );
        return allSpecs.map(item => ({ id: item.id, name: item.name })).sort((a, b) => a.name.localeCompare(b.name));
    }

    async _getSystemSpecialisations(skillKey) {
        if (!skillKey) {
            return [];
        }
        if (!this._allSpecialisations) {
            this._allSpecialisations = await game.impmal.utility.getAllItems("specialisation");
        } return this._allSpecialisations.filter(item => item.system.skill === skillKey);
    }

    async _getActorSpecialisations(skillKey) {
        return this._getEligibleActors().flatMap(actor =>
            fromUuidSync(actor.uuid)
                .items.filter(item => item.type === "specialisation")
                .filter(item => item.system.skill === skillKey)
        );
    }

    async _onSkillChange(event) {
        this.selectedSkill = event.target.value;
        if (this.selectedCharacteristic) {
            this.selectedCharacteristic = "";
            this._updateCharacteristicSelect("");
            this._syncCharacteristicState();
        }
        await this._updateSpecialisations();
    }

    _onDifficultyChange(event) {
        this.selectedDifficulty = event.target.value;
    }

    async _onCharacteristicChange(event) {
        this.selectedCharacteristic = event.target.value;
        this._syncCharacteristicState();
        if (!this.selectedCharacteristic) {
            await this._updateSpecialisations();
        }
    }

    _onPromptAllChange(event) {
        this.promptAll = event.target.checked;
        const list = this._getRoot()?.querySelector(".prompt-roll-targets");
        if (list) {
            list.classList.toggle("is-disabled", this.promptAll);
        }
    }

    async _updateSpecialisations() {
        const select = this._getRoot()?.querySelector("[name='specialisation']");
        if (!select) {
            return;
        }

        const specialisations = await this._getSpecialisations(this.selectedSkill);
        select.innerHTML = "";

        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "(None)";
        select.appendChild(empty);

        for (const spec of specialisations) {
            const option = document.createElement("option");
            option.value = spec.name;
            option.textContent = spec.name;
            select.appendChild(option);
        }
        select.value = "";
    }

    _syncCharacteristicState() {
        const root = this._getRoot();
        if (!root) {
            return;
        }

        const skillGroups = root.querySelectorAll(".prompt-roll-skill-group");
        const hasCharacteristic = Boolean(this.selectedCharacteristic);

        skillGroups.forEach((group) => {
            group.style.display = hasCharacteristic ? "none" : "";
        });
    }

    _updateCharacteristicSelect(value) {
        const select = this._getRoot()?.querySelector("[name='characteristic']");
        if (select) {
            select.value = value;
        }
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

    static async submit(event, form, formData) {
        return this._onPromptPlayers(formData.object);
    }

    async _onPromptPlayers(formData) {
        const data = this._normalizeFormData(formData);
        if (!data.characteristic && !data.skill) {
            return ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.Prompter.NoneSelected"));
        }

        const actors = await this._resolveTargetActors(data);
        if (!actors.length) {
            return ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.Prompter.NoActors"));
        }

        for (const actor of actors) {
            const recipients = this._getRecipients(actor);
            for (const user of recipients) {
                const payload = {
                    actorId: actor.id,
                    userId: user.id,
                    characteristic: data.characteristic,
                    skill: data.skill,
                    specialisation: data.specialisation,
                    difficulty: data.difficulty,
                    modifier: data.modifier,
                    isPrivate: data.isPrivate,
                    state: data.state,
                    sl: data.sl
                };

                if (user.id === game.user.id) {
                    await promptRollOnClient(payload);
                }
                else {
                    game.socket.emit(SOCKET_NAME, { type: "promptRoll", payload });
                }
            }
        }
    }

    _getRecipients(actor) {
        return game.users.filter(user => user.active && !user.isGM && user.character?.id === actor.id);
    }

    _normalizeFormData(formData) {
        const characteristic = formData.characteristic || "";
        const skill = formData.skill || "";
        const specialisation = formData.specialisation || "";
        const difficulty = formData.difficulty || "challenging";
        const modifier = Number(formData.modifier || 0);
        const sl = Number(formData.SL || 0);
        const isPrivate = Boolean(formData.privateRoll);
        const state = formData.state || "normal";
        const promptAll = Boolean(formData.promptAll);
        const selectedActorIds = Array.isArray(formData.actors)
            ? formData.actors
            : (formData.actors ? [formData.actors] : []);

        const useCharacteristic = Boolean(characteristic);

        return {
            characteristic: useCharacteristic ? characteristic : "",
            skill: useCharacteristic ? "" : skill,
            specialisation: useCharacteristic ? "" : specialisation,
            difficulty,
            modifier,
            sl,
            isPrivate,
            state,
            promptAll,
            selectedActorIds
        };
    }

    async _resolveTargetActors(data) {
        if (data.promptAll) {
            return this._getUserCharacters().map(entry => entry.actor);
        }

        const actorIds = new Set(data.selectedActorIds);

        return Array.from(actorIds)
            .map(id => game.actors.get(id))
            .filter(actor => actor);
    }
}

async function promptRollOnClient(payload) {
    if (payload.userId && payload.userId !== game.user.id) {
        return;
    }

    const actor = game.actors.get(payload.actorId);
    if (!actor) {
        return;
    }

    const fields = {
        difficulty: payload.difficulty,
        modifier: payload.modifier,
        SL: payload.sl
    };

    if (payload.isPrivate) {
        fields.rollMode = "gmroll";
    }
    if (payload.state === "advantage") {
        fields.advantage = 1;
    }
    else if (payload.state === "disadvantage") {
        fields.disadvantage = 1;
    }

    if (payload.characteristic) {
        actor.setupCharacteristicTest(payload.characteristic, {
            fields, appendTitle: ` ${game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.Extended")} (${payload.testname})` 
        });
        return;
    }

    const testData = { key: payload.skill };
    if (payload.specialisation) {
        testData.name = payload.specialisation;
    }

    actor.setupSkillTest(testData, {
        fields, appendTitle: ` ${game.i18n.localize("IMPMAL_COMMUNITY.ExtendedTest.Extended")} (${payload.testname})` 
    });
}

export function registerPromptRoll() {
    Hooks.on("ready", () => {
        game.socket.on(SOCKET_NAME, (data) => {
            if (!data || data.type !== "promptRoll") {
                return;
            }
            promptRollOnClient(data.payload);
        });
    });

    Hooks.on("chatMessage", (chatLog, messageText) => {
        if (!messageText?.startsWith("/promptRoll")) {
            return;
        }

        if (!game.user.isGM) {
            ui.notifications.warn(game.i18n.localize("IMPMAL_COMMUNITY.Prompter.OnlyGM"));
            return false;
        }

        new PromptRollDialog().render(true);
        return false;
    });
}
