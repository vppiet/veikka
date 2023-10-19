import {PrivMsgEvent} from 'irc-framework';
import {Command, PRIVILEGE_LEVEL} from '../command';
import {Veikka} from 'veikka';
import {isAdmin} from '../util';

class QuitCommand extends Command {
    constructor(prefix: string, name: string) {
        super(prefix, name, PRIVILEGE_LEVEL.ADMIN);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: {client: Veikka, listener: QuitCommand}, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;
        if (this.listener.privilegeLevel >= PRIVILEGE_LEVEL.ADMIN &&
            !isAdmin(event.ident, event.hostname)) return;

        this.client.quit(Bun.env['QUIT_MSG']);
    }
}

export {QuitCommand};
