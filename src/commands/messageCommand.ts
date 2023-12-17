import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {CommandParam} from '../commandParam';
import {parseStringHead, parseStringTail} from '../commandParamParsers/stringParam';
import {Veikka} from '../veikka';

class MessageCommand extends Command<string> {
    constructor() {
        super('.', 'viesti', [
            '.viesti <kohde> <viesti>',
            'Välitä viesti kanavalle tai käyttäjälle.',
        ], [targetParam, msgParam], PRIVILEGE_LEVEL.ADMIN);
    }

    eventHandler(event: PrivMsgEvent, params: [string, string], client: Veikka) {
        const [target, line] = params;

        if (target.startsWith('#') && client.channels.findIndex((c) => c.name === target) === -1) {
            event.reply(this.createSay(`En ole kanavalla "${target}".`));
            return;
        }

        if (!(target === client.user.nick)) {
            client.say(target, line);
        }
    }
}

const targetParam: CommandParam<string> = {
    name: 'kohde',
    required: true,
    parse: (parts: string[]) => parseStringHead(parts, 1),
};

const msgParam: CommandParam<string> = {
    name: 'viesti',
    required: true,
    parse: parseStringTail,
};

export {MessageCommand};
