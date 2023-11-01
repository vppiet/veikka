import {PrivMsgEvent} from 'irc-framework';
import {milliseconds, parse, isValid, differenceInMilliseconds, isPast} from 'date-fns';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {Context, Initialisable} from '../util';
import {Veikka} from 'veikka';

const FORMAT_DATETIME = 'dd.LL.yyyy HH.mm';

class TimeDelta {
    v?: number;
    kk?: number;
    p?: number;
    t?: number;
    m?: number;
    s?: number;
}

function parseDuration(str: string) {
    const td = new TimeDelta();

    let buffer = '';
    for (let i = 0; i < str.length; i++) {
        if (!isNaN(Number(str[i])) && i !== str.length - 1) {
            buffer += str[i];
        } else if (typeof str[i] === 'string' && str[i] in td) {
            td[str[i] as keyof typeof td] = Number(buffer);
            buffer = '';
        } else {
            return;
        }
    }

    return td;
}

class ReminderCommand extends Command implements Initialisable {
    timers: Timer[] = [];

    constructor() {
        super('.', 'muistutus', PRIVILEGE_LEVEL.USER, 2);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<ReminderCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const now = new Date();
        const [reminderTime, reminderMsg] = this.listener.parseParameters(event.message);

        const duration = parseDuration(reminderTime);
        if (duration) {
            const ms = milliseconds({
                years: duration.v,
                months: duration.kk,
                days: duration.p,
                hours: duration.t,
                minutes: duration.m,
                seconds: duration.s,
            });
            this.listener.addTimer(event, reminderMsg, reminderTime, ms);
            return;
        }

        const datetime = parse(reminderTime, FORMAT_DATETIME, now);
        if (!isValid(datetime.getTime())) {
            event.reply(event.nick + ': Anna muistutuksen aika joko muodossa "1y2m3p4t5m6s"' +
                'tai "31.10.2023 15.56"');
            return;
        }

        if (isPast(datetime)) {
            event.reply(event.nick + ': Peelo! Aika on menneisyydessä.');
            return;
        }

        const ms = differenceInMilliseconds(datetime, now);
        this.listener.addTimer(event, reminderMsg, reminderTime, ms);
    }

    addTimer(event: PrivMsgEvent, reminderMsg: string, reminderTime: string, ms: number) {
        const timer = () => {
            event.reply(`${event.nick}: ${reminderMsg} (muistutus ${reminderTime})`);
        };
        this.timers.push(setTimeout(timer, ms));
    }

    initialise(client: Veikka): void {
        client.addListener('socket close', this.clearTimers, this);
    }

    clearTimers() {
        this.timers.forEach((t) => clearTimeout(t));
    }
}

export {ReminderCommand};
