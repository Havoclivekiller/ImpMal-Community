const PREFIX = "IMPMAL_COMMUNITY.zoneTooltip.";

/** Read the same two sources used by warhammer-lib's internal ZoneHelpers.getZoneEffects.
 * Keep them separate for display, without mutating effects or executing their scripts.
 */
export function getZoneTooltipData(region) {
    const config = game.impmal.config;
    const greatestTrait = traits => config.traitOrder[Math.max(-1,
        ...traits.map(trait => config.traitOrder.indexOf(trait)))];
    return {
        name: region.name,
        traits: config.getZoneTraitEffects(region, greatestTrait),
        effects: region.getFlag("impmal", "effects") || []
    };
}

export function registerZoneTooltip() {
    if (game.system.id !== "impmal" || !game.settings.get("impmal-community", "zoneTooltip")) return;

    let view, tooltip, timer, pointer, signature = "";
    let keyHeld = false;
    const localize = key => game.i18n.localize(PREFIX + key);
    const hide = () => {
        clearTimeout(timer);
        signature = "";
        tooltip?.remove();
        tooltip = null;
    };
    const leave = () => { pointer = null; hide(); };
    const blur = () => { keyHeld = false; leave(); };

    game.keybindings.register("impmal-community", "zoneTooltipHold", {
        name: PREFIX + "KeybindingName",
        hint: PREFIX + "KeybindingHint",
        editable: [{key: "AltLeft"}],
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
        onDown: () => {
            keyHeld = true;
            refresh();
            return false; // Allow Foundry's Alt highlighting to work too.
        },
        onUp: () => {
            keyHeld = false;
            hide();
            return false;
        }
    });

    function position() {
        if (!tooltip || !pointer) return;
        const {width, height} = tooltip.getBoundingClientRect();
        const x = pointer.x + width + 18 > window.innerWidth ? pointer.x - width - 18 : pointer.x + 18;
        const y = pointer.y + height + 18 > window.innerHeight ? pointer.y - height - 18 : pointer.y + 18;
        tooltip.style.left = `${Math.max(8, x)}px`;
        tooltip.style.top = `${Math.max(8, y)}px`;
    }

    function append(parent, tag, text) {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
    }

    function addEffects(section, title, effects) {
        if (!effects.length) return;
        append(section, "h4", localize(title));
        const list = document.createElement("ul");
        section.append(list);
        for (const effect of effects) {
            const row = document.createElement("li");
            list.append(row);
            const heading = document.createElement("div");
            heading.className = "zone-effect-heading";
            row.append(heading);
            if (effect.img) {
                const image = document.createElement("img");
                image.src = effect.img;
                image.alt = "";
                image.width = image.height = 20;
                heading.append(image);
            }
            append(heading, "strong", game.i18n.localize(effect.name || "")
                + (effect.disabled ? ` (${localize("Disabled")})` : ""));
            if (effect.description) {
                // Display text only; never execute effect HTML or reveal GM secret blocks.
                const parsed = new DOMParser().parseFromString(effect.description, "text/html");
                parsed.querySelectorAll("script, style, template").forEach(node => node.remove());
                if (!game.user.isGM) parsed.querySelectorAll(".secret").forEach(node => node.remove());
                const description = parsed.body.textContent.trim();
                if (description) append(row, "p", description);
            }
        }
    }

    function refresh() {
        if (!keyHeld || !pointer || !canvas.ready || !canvas.stage) return hide();
        const global = new PIXI.Point();
        canvas.app.renderer.events.mapPositionToPoint(global, pointer.x, pointer.y);
        const point = canvas.stage.toLocal(global);
        if (!game.user.isGM && !canvas.visibility.testVisibility(point, {tolerance: 0})) return hide();

        // Use geometry directly: native hoverRegion requires the Regions layer to be active.
        const regions = canvas.regions.placeables.filter(region => !region.isPreview
            && (!region.document.levels.size || region.document.levels.has(canvas.level.id))
            && region.isVisible && region.document.polygonTree.testPoint(point));
        if (!regions.length) return hide();
        const data = regions.map(region => getZoneTooltipData(region.document));
        const next = JSON.stringify(data);
        if (tooltip && next === signature) return position();
        hide();
        signature = next;
        tooltip = document.createElement("aside");
        tooltip.className = "impmal-community-zone-tooltip";
        tooltip.setAttribute("role", "tooltip");
        for (const zone of data) {
            const section = document.createElement("section");
            tooltip.append(section);
            append(section, "h3", zone.name);
            addEffects(section, "Traits", zone.traits);
            addEffects(section, "Effects", zone.effects);
            if (!zone.traits.length && !zone.effects.length) append(section, "p", localize("Empty"));
        }
        document.body.append(tooltip);
        position();
    }

    function move(event) {
        if (event.buttons) return leave();
        pointer = {x: event.clientX, y: event.clientY};
        hide();
        if (keyHeld) timer = setTimeout(refresh, 350);
    }

    function detach() {
        leave();
        view?.removeEventListener("pointermove", move);
        view?.removeEventListener("pointerleave", leave);
        view?.removeEventListener("pointerdown", leave);
        window.removeEventListener("blur", blur);
        view = null;
    }

    Hooks.on("canvasReady", () => {
        detach();
        view = canvas.app.view;
        view.addEventListener("pointermove", move);
        view.addEventListener("pointerleave", leave);
        view.addEventListener("pointerdown", leave);
        window.addEventListener("blur", blur);
    });
    Hooks.on("canvasTearDown", detach);
    for (const hook of ["createRegion", "updateRegion", "deleteRegion", "sightRefresh", "canvasPan"]) {
        Hooks.on(hook, () => {
            if (!pointer) return;
            hide();
            timer = setTimeout(refresh, 100);
        });
    }
}
