const old_computeOwnedProtectionModel = ProtectionModel.prototype.computeOwned;
const old_computeArmourStandardCombatModel = StandardCombatModel.prototype.computeArmour;

export function registerAlternativeMasterCrafted() {
    ProtectionModel.prototype.computeOwned = new_computeArmourProtectionModel;
    StandardCombatModel.prototype.computeArmour = new_computeArmourStandardCombatModel;
}

function new_computeArmourProtectionModel() {
    old_computeOwnedProtectionModel.call(this);

    // System method adds +2 Armour, so we need to remove that
    if (this.traits.has("mastercrafted") && this.category != "power") {
        this.armour -= 1;
        if (this.traits.has("shoddy")) this.armour = Math.max(1, this.armour);
    }
}

function new_computeArmourStandardCombatModel(items) {
    old_computeArmourStandardCombatModel.call(this, items);

    // System method goes through items to change Armour, we need to go too and change based on our rule
    let protectionItems = items.protection.filter(i => i.system.isEquipped);
    for (let item of protectionItems) {
        if (!item.system.traits.has("mastercrafted") || item.system.category == "power") continue;
        let standardArmour = item.system.armour + 2;
        let alternativeArmour = item.system.armour + 1;
        if (item.system.traits.has("shoddy")) {
            standardArmour = Math.max(1, standardArmour - 2);
            alternativeArmour = Math.max(1, alternativeArmour - 2);
        }
        for (let loc of item.system.locations.list) {
            if (this.hitLocations[loc] && !item.system.destroyed[loc]) {
                let damage = item.system.damage[loc] || 0;
                this.hitLocations[loc].armour += Math.max(0, alternativeArmour - damage) - Math.max(0, standardArmour - damage);
            }
        }
    }
}
