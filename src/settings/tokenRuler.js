const IMPMAL_COMMUNITY = {
    speedValues: {
        slow: 4,
        normal: 8,
        fast: 12,
        swift: 16
    },

    tokenRulerColors: {
        normal: 0x33BC4E,
        double: 0xF1D836,
        triple: 0xE72124
    }
};

export function registerTokenRuler() {
    CONFIG.Token.rulerClass = ImpMalTokenRuler;
}

class ImpMalTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    _getSegmentStyle(waypoint) {
        const style = super._getSegmentStyle(waypoint);
        return this.#getSpeedBasedStyle(waypoint, style);
    }

    _getGridHighlightStyle(waypoint, offset) {
        const style = super._getGridHighlightStyle(waypoint, offset);
        return this.#getSpeedBasedStyle(waypoint, style);
    }

    #getSpeedBasedStyle(waypoint, style) {
        const plannedMovement = this.token._plannedMovement ?? {};
        if (!(game.user?.id in plannedMovement)) return style;
        const speedValue = this.#getTokenSpeedValue();
        if (!speedValue) return style;

        const { normal, double, triple } = IMPMAL_COMMUNITY.tokenRulerColors ?? {};
        const increment = (waypoint.measurement?.cost ?? 0) / speedValue;
        if (increment <= 1) style.color = normal ?? style.color;
        else if (increment <= 2) style.color = double ?? style.color;
        else style.color = triple ?? style.color;
        return style;
    }

    #getTokenSpeedValue() {
        const speedKey = this.token.actor?.system?.combat?.speed?.land?.value;
        if (!speedKey || speedKey === "none") return 0;
        const speedValues = IMPMAL_COMMUNITY.speedValues ?? {};
        return speedValues[speedKey] ?? 0;
    }
}
