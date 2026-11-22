const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { BooleanField, SchemaField } = foundry.data.fields;

export class SpreadSettings extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "impmal-community-spread-settings",
        tag: "form",
        classes: ["impmal", "warhammer", "spread-settings"],
        window: {
            title: "IMPMAL_COMMUNITY.SpreadSettings.Name",
            contentClasses: ["standard-form"],
            resizable: true
        },
        position: {
            width: 560
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: true,
            handler: this.submit
        },
        actions: {
            reset: this._onReset
        }
    };

    static PARTS = {
        form: {
            template: "modules/impmal-community/templates/spread-settings.hbs",
            scrollable: [""]
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    static #schema = new SchemaField({
        enabled: new BooleanField({
            initial: false,
            label: "IMPMAL_COMMUNITY.SpreadSettings.Enabled.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.Enabled.Hint"
        }),
        onlyNeedsToHit: new BooleanField({
            initial: false,
            label: "IMPMAL_COMMUNITY.SpreadSettings.OnlyNeedsToHit.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.OnlyNeedsToHit.Hint"
        }),
        roundDown: new BooleanField({
            initial: true,
            label: "IMPMAL_COMMUNITY.SpreadSettings.RoundDown.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.RoundDown.Hint"
        }),
        useTraits: new BooleanField({
            initial: true,
            label: "IMPMAL_COMMUNITY.SpreadSettings.UseTraits.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.UseTraits.Hint"
        }),
        useWeaponDamage: new BooleanField({
            initial: false,
            label: "IMPMAL_COMMUNITY.SpreadSettings.UseWeaponDamage.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.UseWeaponDamage.Hint"
        }),
        meleeStartingPointAttacker: new BooleanField({
            initial: true,
            label: "IMPMAL_COMMUNITY.SpreadSettings.MeleeStartingPointAttacker.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.MeleeStartingPointAttacker.Hint"
        }),
        attackerImmuneToSpread: new BooleanField({
            initial: true,
            label: "IMPMAL_COMMUNITY.SpreadSettings.AttackerImmuneToSpread.Name",
            hint: "IMPMAL_COMMUNITY.SpreadSettings.AttackerImmuneToSpread.Hint"
        })
    });

    static get schema() {
        return this.#schema;
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.settings = game.settings.get("impmal-community", "spreadSettings");
        context.schema = this.constructor.schema;
        context.buttons = [
            {
                type: "button",
                icon: "fa-solid fa-arrow-rotate-left",
                label: "IMPMAL_COMMUNITY.SpreadSettings.Reset",
                action: "reset"
            },
            { type: "submit", icon: "fa-solid fa-floppy-disk", label: "SETTINGS.Save" }
        ];
        return context;
    }

    static async submit(event, form, formData) {
        return SpreadSettings.saveSettings(formData.object);
    }

    static async saveSettings(settings) {
        const previous = game.settings.get("impmal-community", "spreadSettings");
        await game.settings.set("impmal-community", "spreadSettings", settings);

        // Automation will be registered at init, so toggling it requires all clients to reload.
        if (previous.enabled !== settings.enabled) {
            await foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
        }
    }

    static async _onReset(event, target) {
        await SpreadSettings.saveSettings(this.constructor.schema.getInitialValue());
        this.render({ force: true });
    }
}
