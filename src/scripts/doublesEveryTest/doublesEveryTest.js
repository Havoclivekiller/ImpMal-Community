export function registerDoublesEveryTest() {
    Hooks.on('renderChatMessage', (message, html, messageData) => {
        if (game.settings.get("impmal-community", "computeDoublesAll") === true) {
            if (message.content)
                if (message.content.includes(game.i18n.localize("IMPMAL.Fumble")) || message.content.includes(game.i18n.localize("IMPMAL.Critical"))) {
                    return true;
                }

            if (message.rolls[0])
                if ((message.rolls[0].total % 11 === 0) || message.rolls[0].total === 100) {
                    if (html[0].querySelector('.sl'))
                        if (html[0].querySelector('.sl').textContent) {
                            let toInsert = html[0].querySelector('.sl').textContent.includes('+') ? game.i18n.localize("IMPMAL.Critical") : game.i18n.localize("IMPMAL.Fumble");
                            html[0].querySelector('.tags').insertAdjacentHTML('beforeend', `<div>${toInsert}</div>`)
                        }
                }
        }
    });
}
}