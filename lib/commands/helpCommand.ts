import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL, Params} from '../command';
import {Veikka} from 'veikka';

class HelpCommand extends Command {
    constructor() {
        super('.', 'ohje', [
            '.ohje [komento]',
            'Argumenttina tälle komennolle voi antaa toisen komennon nimen ilman etuliitettä, ' +
                'mikä palauttaa ko. komennon ohjeen. ' +
                'Komentojen argumentit erotetaan pilkuilla ja merkitään ' +
                'seuraavasti: .komento <pakollinen>, [vaihtoehtoinen]',
        ], 0, 1);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka): void {
        // show only default-privileged commands
        const cmds = client.commands.filter((c) => c.privilegeLevel === PRIVILEGE_LEVEL.USER);
        const cmdsList = cmds.sort((a, b) => a.name.localeCompare(b.name));
        const cmdsStr = 'Komennot: ' + cmdsList.map((c) => c.getPrefixedName()).join(', ');
        const cmdNamesStr = 'Komentojen nimet: ' + cmdsList.map((c) => c.name).join(', ');

        const name = params.opt[0];

        if (name) {
            const filtered = cmds.filter((c) => {
                return c.name.toLowerCase() === name.toLowerCase();
            });

            if (filtered.length) {
                const found = filtered[0];
                event.reply(found.getHelp());
            } else {
                event.reply(this.createSay('Komentoa ei löytynyt.', cmdNamesStr));
            }
        } else {
            event.reply(this.getHelp(cmdsStr));
        }
    }
}

export {HelpCommand};
