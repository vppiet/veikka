import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL, Params} from '../command';
import {Veikka} from 'veikka';

class QuitCommand extends Command {
    constructor() {
        super('.', 'sulje', [
            '.sulje [viesti]',
            'Sulje botti.',
        ], 0, 1, PRIVILEGE_LEVEL.ADMIN);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka) {
        const quitMsg = params.opt[0];

        if (quitMsg) {
            client.quit(quitMsg);
        } else {
            client.quit(Bun.env['QUIT_MSG']);
        }
    }
}

export {QuitCommand};
