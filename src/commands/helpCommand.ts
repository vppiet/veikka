import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {CommandParam} from '../commandParam';
import {parseStringHead} from '../commandParamParsers/stringParam';
import {Veikka} from '../veikka';

class HelpCommand extends Command<[string | undefined]> {
    constructor() {
        super('.', 'ohje', [
            '.ohje [komento]',
            'Argumenttina tälle komennolle voi antaa toisen komennon nimen ilman etuliitettä, ' +
                'mikä palauttaa ko. komennon ohjeen. ' +
                'Komentojen argumentit erotetaan pilkuilla ja merkitään ' +
                'seuraavasti: .komento <pakollinen>, [vaihtoehtoinen]',
        ], [cmdParam]);
    }

    eventHandler(event: PrivMsgEvent, params: [string], client: Veikka): void {
        // show only user-privileged commands
        const cmds = client.commands.filter((c) => c.privilegeLevel === PRIVILEGE_LEVEL.USER);
        const cmdsList = cmds.sort((a, b) => a.name.localeCompare(b.name));
        const cmdsStr = 'Komennot: ' + cmdsList.map((c) => c.getPrefixedName()).join(', ');
        const cmdNamesStr = 'Komentojen nimet: ' + cmdsList.map((c) => c.name).join(', ');

        const name = params[0];

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

const cmdParam: CommandParam<string> = {
    name: 'komento',
    required: false,
    parse: (parts: string[]) => parseStringHead(parts, 1),
} as const;

export {HelpCommand};
