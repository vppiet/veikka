import {PrivMsgEvent} from 'irc-framework';
import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context} from '../util';

class JoinCommand extends Command {
    constructor() {
        super('.', 'liity', PRIVILEGE_LEVEL.ADMIN, 1);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<JoinCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message, event.ident, event.hostname)) return;
        const param = event.message.trim().split(' ')[1];

        // already in the buffer
        if (this.client.channels.findIndex((c) => c.name === param) !== -1) return;

        const channel = this.client.channel(param);
        channel.join();
        this.client.channels.push(channel);
    }
}

export {JoinCommand};
