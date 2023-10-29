import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context} from '../util';

/*
.muistutus 8m30s, munat valmiit
.muistutus 3.11. 12.00, hammaslääkäri
*/

class ReminderCommand extends Command {
    constructor() {
        super('.', 'muistutus', PRIVILEGE_LEVEL.USER, 2);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<ReminderCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const params = this.listener.parseParameters(event.message);
        console.log(params);
    }
}

export {ReminderCommand};
