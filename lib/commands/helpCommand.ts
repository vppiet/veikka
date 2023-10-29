import {PrivMsgEvent} from 'irc-framework';
import {Command} from '../command';
import {Context} from '../util';

class HelpCommand extends Command {
    constructor() {
        super('.', 'apua');
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<HelpCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const cmds = this.client.commands.map((c) => c.getPrefixedName()).sort().join(', ');
        event.reply('Komennot: ' + cmds);
    }
}

export {HelpCommand};
