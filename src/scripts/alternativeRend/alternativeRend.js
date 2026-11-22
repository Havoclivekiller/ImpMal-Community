export function registerAlternativeRend() {
    foundry.utils.mergeObject(IMPMAL.weaponTraitEffects, {
        rend: {
            name: "IMPMAL.Rend",
            system: {
                transferData: {
                    documentType: "Item"
                },
                scriptData: [{
                    label: "Boosted Rend (Pen)",
                    trigger: "preApplyDamage",
                    script: `
                    if (args?.traits) {
                        let rend = args.traits.has("rend");
                        if (rend) {
                            let addPen = Math.floor(Number(rend.value || 0) / ${IMPMAL.rendDivider});
                            args.penetrating = Number(args.penetrating) + Number(addPen);
                        }
                    }`
                }]
            }
        }
    })
}