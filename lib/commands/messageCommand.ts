import {Veikka} from 'veikka';
import {PrivMsgEvent} from '../../types/irc-framework';
import {Command, PRIVILEGE_LEVEL, Params} from '../command';

class MessageCommand extends Command {
    constructor() {
        super('.', 'viesti', [
            '.viesti <kohde>, <viesti>',
            'Välitä viesti kanavalle tai käyttäjälle.',
        ], 2, 0, PRIVILEGE_LEVEL.ADMIN);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka) {
        const target = params.req[0];
        const line = params.req[1];

        if (target.startsWith('#') && client.channels.findIndex((c) => c.name === target) === -1) {
            event.reply(this.createSay(`En ole kanavalla "${target}".`));
            return;
        }

        client.say(target, line);
    }
}

export {MessageCommand};
