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
    }
}

function new_computeArmourStandardCombatModel(items) {
    old_computeArmourStandardCombatModel.call(this, items);

    // System method goes through items to change Armour, we need to go too and change based on our rule
    let protectionItems = items.protection.filter(i => i.system.isEquipped);
    for (let item of protectionItems) {
        let mastercraftedBonus = 0;
        if (item.system.traits.has("mastercrafted") && item.system.category != "power") {
            mastercraftedBonus = -1;
        }
        for (let loc of item.system.locations.list) {
            if (this.hitLocations[loc]) {
                this.hitLocations[loc].armour += mastercraftedBonus;
            }
        }
    }
}
