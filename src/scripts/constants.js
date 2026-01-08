const IMPMAL_COMMUNITY = {
    speedValues: {
        slow: 4,
        normal: 8,
        fast: 12,
        swift: 16
    },

    tokenRulerColors: {
        normal: 0x008000,
        double: 0xFFFF00,
        triple: 0xFF8C00,
        quadruple: 0xFF0000,
        beyond: 0x0000FF
    },

    rendDivider: 2, //Rend will be divided, rounded down, by this number

    superiority:
    {
        spend: {
            additionalAction: 4,
            littleBoost: 1,
            fleeFromHarm: 2,
            breakDown: 5,
            makeItCount: {
                adv0: 2,
                adv1: 3,
                adv2: 4,
                adv3: 5
            }
        },
        gain: {
            surprise: 2,
            sizeUp: 2,
            sizeUpPlus: 3,
            victory: 1,
            greaterVictory: 2,
            winning: 1,
            outmanoeuvre: 1,
            woundedPride: 1
        },
    }
};

export function registerConstants() {
    foundry.utils.mergeObject(IMPMAL, IMPMAL_COMMUNITY, { overwrite: false });
}
