import { IMPMAL_COMMUNITY } from "./constants.js";

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
        if (waypoint.userId && (waypoint.userId !== game.user?.id)) return style;
        const speedValue = this.#getTokenSpeedValue();
        if (!speedValue) return style;

        const { normal, double, triple, quadruple, beyond } = IMPMAL_COMMUNITY.tokenRulerColors ?? {};
        const increment = (waypoint.measurement?.cost ?? 0) / speedValue;
        if (increment <= 1) style.color = normal ?? style.color;
        else if (increment <= 2) style.color = double ?? style.color;
        else if (increment <= 3) style.color = triple ?? style.color;
        else if (increment <= 4) style.color = quadruple ?? style.color;
        else style.color = beyond ?? style.color;
        return style;
    }

    #getTokenSpeedValue() {
        const speedKey = this.token.actor?.system?.combat?.speed?.land?.value;
        if (!speedKey || speedKey === "none") return 0;
        const speedValues = IMPMAL_COMMUNITY.speedValues ?? {};
        return speedValues[speedKey] ?? 0;
    }
}
