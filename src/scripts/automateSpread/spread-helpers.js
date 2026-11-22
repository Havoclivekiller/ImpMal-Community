export function getAttackDamage(item) {
    return item?.type === "trait" ? item.system?.attack?.damage : item?.system?.damage;
}

export function canApplySpread(item, test, result, damageData, settings) {
    if (!settings.enabled || !["weapon", "trait"].includes(item?.type)) return false;
    if (result?.winner !== "attacker") return false;
    if (!test.itemTraits?.has("spread") && test.result?.fireMode !== "rapidFireSpread") return false;
    if (settings.onlyNeedsToHit) return true;

    const damage = getAttackDamage(item);
    // Match Inflict: weapons' prepared SL is always true; traits use their saved SL checkbox.
    const traitSL = item.type === "trait" && (item._source?.system?.attack?.damage?.SL ?? damage?.SL);
    const requiresWounds = Boolean(Number(damage?.base) || damage?.characteristic || traitSL);
    return !requiresWounds || damageData?.woundsGained > 0;
}

export function getSpreadDamage(attackDamage, weaponDamage, settings, full = false) {
    const damage = Math.max(0, Number(settings.useWeaponDamage ? weaponDamage : attackDamage));
    if (!Number.isFinite(damage)) throw new Error("Invalid Spread damage");
    return full ? damage : (settings.roundDown ? Math.floor(damage / 2) : Math.ceil(damage / 2));
}

export function isWithinImmediateRange(origin, target) {
    if (origin.parent?.id !== target.parent?.id || origin.level !== target.level) return false;
    const grid = origin.parent.grid;
    if (grid.isGridless) {
        const a = origin.getCenterPoint();
        const b = target.getCenterPoint();
        return Math.hypot(a.x - b.x, a.y - b.y) <= grid.size
            && Math.abs(origin.elevation - target.elevation) <= grid.distance;
    }

    // Occupied cells include the footprints of large tokens. Ignore movement diagonal rules:
    // Spread reaches all eight neighbouring squares, including when diagonal movement is illegal.
    const originOffsets = origin.getOccupiedGridSpaceOffsets();
    const targetOffsets = target.getOccupiedGridSpaceOffsets();
    return originOffsets.some(a => targetOffsets.some(b => {
        if (Math.abs((a.k ?? 0) - (b.k ?? 0)) > 1) return false;
        if (grid.isSquare) return Math.max(Math.abs(a.i - b.i), Math.abs(a.j - b.j)) <= 1;
        return (a.i === b.i && a.j === b.j)
            || grid.testAdjacency({i: a.i, j: a.j}, {i: b.i, j: b.j});
    }));
}

export function getSpreadTargets(origin, originalTarget, attacker, settings) {
    return origin.parent.tokens.filter(token => {
        if (!token.actor?.system?.combat || token.uuid === originalTarget.uuid) return false;
        if (settings.attackerImmuneToSpread && token.uuid === attacker?.uuid) return false;
        return isWithinImmediateRange(origin, token);
    });
}
