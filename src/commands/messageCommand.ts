import {PrivMsgEvent} from 'irc-framework';

import {ARG_SEP, Command, PRIVILEGE_LEVEL} from '../command';
import {CommandParam} from '../commandParam';
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
    required: true,
    parse: function(parts: string[]) {
        if (!parts[0]) {
            return {error: 'Kohde (kanava tai käyttäjä) puuttuu'};
        }

        return {value: parts[0], consumed: [parts[0]]};
    },
};

const msgParam: CommandParam<string> = {
    required: true,
    parse: function(parts: string[]) {
        if (!parts[0]) {
            return {error: 'Viesti puuttuu'};
        }

        return {value: parts.join(ARG_SEP), consumed: [parts[0]]};
    },
};

export {MessageCommand};

