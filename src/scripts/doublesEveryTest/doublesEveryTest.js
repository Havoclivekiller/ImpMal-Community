export function registerDoublesEveryTest() {
    Hooks.on('createChatMessage', async (message) => {
        if (message.content.includes(game.i18n.localize("IMPMAL.Fumble")) || message.content.includes(game.i18n.localize("IMPMAL.Critical"))) {
            return true;
        }
        if (!message.rolls?.[0]) return;

        const roll = message.system?.result?.roll;
        if ((roll % 11 !== 0) && roll !== 100) return;

        let toInsert = (message.system.result.SL >= 0 && message.system.result.outcome === "success")
            ? game.i18n.localize("IMPMAL.Critical")
            : game.i18n.localize("IMPMAL.Fumble");

        const insertHtml = `<div>${toInsert}</div>`;
        const updated = message.content.replace(
            '<div class="tags">',
            `<div class="tags">${insertHtml}`
        );

        if (updated !== message.content) {
            await message.update({ content: updated });
        }
    });
}