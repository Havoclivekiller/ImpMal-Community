export class PartyModel extends StandardActorModel {
    static preventItemTypes = ["boonLiability", "corruption", "power", "specialisation", "talent", "duty", "faction", "origin", "role", "trait", "critical", "injury", "pack"];

    static defineSchema() {
        const fields = foundry.data.fields;
        let schema = super.defineSchema();
        schema.patronRef = new fields.DocumentUUIDField({ initial: null });
        schema.partyMembers = new fields.ArrayField(new fields.StringField({ initial: "" }));
        schema.solars = new fields.NumberField({ initial: 0 });

        schema.autoCalc.fields = {}

        return schema;
    }

    computeDerived() {
        const equippedTypes = new Set([
            "weapon",
            "protection",
            "forceField",
            "equipment",
            "modification",
            "augmetic",
            "ammo"
        ]);

        const updates = [];
        for (const item of this.parent.items.contents) {
            if (!equippedTypes.has(item.type)) {
                continue;
            }
            if (item?.system?.equipped?.value) {
                updates.push({
                    _id: item.id,
                    "system.equipped.value": false
                });
            }
        }

        if (updates.length) {
            this.parent.update({ items: updates });
        }

        super.computeDerived();
    }
}
