import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context} from '../util';

/*
.muistutus 1v8m30s, vuoden munat valmiit
.muistutus 3.11. 12.00, hammaslääkäri
*/

const FORMAT_DATETIME = '';

class Delta {
    v?: number;
    kk?: number;
    p?: number;
    t?: number;
    m?: number;
    s?: number;
}

function parseDelta(str: string) {
    const delta = new Delta();

    let buffer = '';
    for (let i = 0; i < str.length; i++) {
        if (!isNaN(Number(str[i]))) {
            buffer += str[i];
        } else if (typeof str[i] === 'string' && str[i] in delta) {
            delta[str[i] as keyof typeof delta] = Number(buffer);
            buffer = '';
        } else {
            throw new Error('Delta time parse error');
        }
    }

    return delta;
}

class ReminderCommand extends Command {
    constructor() {
        super('.', 'muistutus', PRIVILEGE_LEVEL.USER, 2);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<ReminderCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const now = new Date();

        const params = this.listener.parseParameters(event.message);
        console.log(params);
        console.log(parseDelta(params[0]));
    }
}

export {ReminderCommand};
