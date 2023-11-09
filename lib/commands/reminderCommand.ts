import {PrivMsgEvent} from 'irc-framework';
import {milliseconds, parse, isValid, differenceInMilliseconds, isPast, addMilliseconds, parseISO,
    format} from 'date-fns';

import {Command} from '../command';
import {Context, Initialisable} from '../util';
import {Veikka} from 'veikka';
import {ReminderTable} from '../db/reminder';

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
    table?: ReminderTable;

    constructor() {
        super('.', 'muistutus', 1, 1);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<ReminderCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const now = new Date();
        const {req, opt} = this.listener.parseParameters(event.message);
        const reminderTime = req[0];
        const reminderMsg = opt[0];

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
            const insertResult = this.listener.table?.insertOne(event.nick, event.target,
                now.toISOString(), addMilliseconds(now, ms).toISOString(), reminderMsg);
            this.listener.addTimer(this.client, event.target, event.nick, ms,
                format(now, FORMAT_DATETIME), reminderMsg, insertResult?.id);
            return;
        }

        const datetime = parse(reminderTime, FORMAT_DATETIME, now);
        if (!isValid(datetime.getTime())) {
            event.reply(event.nick + ': Muistutuksen aika on oltava joko muodossa "1v2kk3p4t5m6s"' +
                'tai "31.10.2023 15.56"');
            return;
        }

        if (isPast(datetime)) {
            event.reply(event.nick + ': Peelo! Aika on menneisyydessä.');
            return;
        }

        const ms = differenceInMilliseconds(datetime, now);
        const insertResult = this.listener.table?.insertOne(event.nick, event.target,
            now.toISOString(), datetime.toISOString(), reminderMsg);
        this.listener.addTimer(this.client, event.target, event.nick, ms,
            format(now, FORMAT_DATETIME), reminderMsg, insertResult?.id);
    }

    addTimer(client: Veikka, channel: string, nick: string, ms: number, createdAt: string,
        reminderMsg?: string, id?: number) {
        const timer = () => {
            client.say(channel, `Muistutus | ` +
                `${reminderMsg || 'Ei viestiä'} | ` +
                `${nick} | ` +
                `${createdAt}`);

            if (id) {
                this.table?.deleteOne(id, nick, channel);
            }
        };

        this.timers.push(setTimeout(timer, ms));
    }

    initialise(client: Veikka) {
        client.addListener('socket close', this.clearTimers, this);
        this.table = new ReminderTable(client.db);
        this.table.deletePast();
        const futureReminders = this.table.getFuture();
        const now = new Date();
        for (const reminder of futureReminders) {
            const datetime = parseISO(reminder.reminder_datetime);
            const ms = differenceInMilliseconds(datetime, now);
            this.addTimer(client, reminder.channel, reminder.nick, ms,
                format(new Date(reminder.created_at), FORMAT_DATETIME), reminder.reminder_text,
                reminder.id);
        }
    }

    clearTimers() {
        this.timers.forEach((t) => clearTimeout(t));
    }
}

export {ReminderCommand};
