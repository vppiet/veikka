import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context} from '../util';

class QuitCommand extends Command {
    constructor() {
        super('.', 'sulje', [
            '.sulje [viesti]',
            'Sulje botti.',
        ], 0, 1, PRIVILEGE_LEVEL.ADMIN);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<QuitCommand>, event: PrivMsgEvent): void {
        const cmd = this.listener;
        const client = this.client;

        if (!cmd.match(event.message, event.ident, event.hostname)) return;

        const {opt} = cmd.parseParameters(event.message);
        const quitMsg = opt[0];

        if (quitMsg) {
            client.quit(quitMsg);
        } else {
            client.quit(Bun.env['QUIT_MSG']);
        }
    }
}

export {QuitCommand};
