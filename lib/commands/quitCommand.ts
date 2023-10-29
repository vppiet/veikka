import {PrivMsgEvent} from 'irc-framework';
import {Command, PRIVILEGE_LEVEL} from '../command';
import {Veikka} from 'veikka';

class QuitCommand extends Command {
    constructor() {
        super('.', 'sulje', PRIVILEGE_LEVEL.ADMIN);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: {client: Veikka, listener: QuitCommand}, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message, event.ident, event.hostname)) return;

        this.client.quit(Bun.env['QUIT_MSG']);
    }
}

export {QuitCommand};
