import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context} from '../util';

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

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<HelpCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        // show only default-privileged commands
        const cmds = this.client.commands.filter((c) => c.privilegeLevel === PRIVILEGE_LEVEL.USER);
        const cmdsList = cmds.sort((a, b) => a.name.localeCompare(b.name));
        const cmdsStr = 'Komennot: ' + cmdsList.map((c) => c.getPrefixedName()).join(', ');
        const cmdNamesStr = 'Komentojen nimet: ' + cmdsList.map((c) => c.name).join(', ');

        const {opt} = this.listener.parseParameters(event.message);
        const name = opt[0];

        if (name) {
            const filtered = cmds.filter((c) => {
                return c.name.toLowerCase() === name.toLowerCase();
            });

            if (filtered.length) {
                const found = filtered[0];
                event.reply(found.getHelp());
            } else {
                event.reply(this.listener.createSay('Komentoa ei löytynyt.', cmdNamesStr));
            }
        } else {
            event.reply(this.listener.getHelp(cmdsStr));
        }
    }
}

export {HelpCommand};
