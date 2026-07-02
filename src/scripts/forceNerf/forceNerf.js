export function registerForceNerf() {
    foundry.utils.mergeObject(IMPMAL.weaponCategoryEffects, {
        force: {
            name: "IMPMAL.Force",
            system: {
                transferData: {
                    documentType: "Item"
                },
                scriptData: [{
                    label: "Add Warp Charge to Damage",
                    trigger: "dialog",
                    script: "args.fields.damage += Math.min(args.actor.system.warp.charge, args.actor.system.characteristics.wil.bonus); if (args.target?.system.species == 'Daemon') args.fields.damage += Math.min(args.actor.system.warp.charge, args.actor.system.characteristics.wil.bonus);",
                    options: {
                        hideScript: "return args.actor.system.warp.charge == 0 || args.actor.defendingAgainst;",
                        activateScript: "return true;",
                    }
                }]
            }
        }
    })
}