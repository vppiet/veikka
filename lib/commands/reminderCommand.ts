import {PrivMsgEvent} from 'irc-framework';
import {milliseconds, parse, isValid, isPast, addMilliseconds, format,
    getUnixTime, fromUnixTime, differenceInMilliseconds} from 'date-fns';

import {Command} from '../command';
import {Closeable, Context, INTERVAL, Initialisable} from '../util';
import {Veikka} from '../veikka';
import {ReminderRow, ReminderTable} from '../db/reminder';
import Database from 'bun:sqlite';

const FORMAT_DATETIME = 'dd.LL.yyyy HH:mm';
const UPDATE_INTERVAL = 30 * INTERVAL.MINUTE;
const MAX_TIMER_INTERVAL = INTERVAL.HOUR;

class TimeDelta {
    v?: number;
    kk?: number;
    p?: number;
    t?: number;
    m?: number;
    s?: number;
}

type ReminderTimer = {
    id?: number;
    timer: Timer;
};

function parseDuration(str: string) {
    const td: TimeDelta = new TimeDelta();

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

class ReminderCommand extends Command implements Initialisable, Closeable {
    timers: ReminderTimer[] = [];
    table: ReminderTable;
    updater?: Timer;

    constructor(conn: Database) {
        super('.', 'muistutus', [
            '.muistutus <aika>, [viesti]',
            'Aseta muistutus.',
            'Aika-argumentti voi olla joko ajankohta ("11.11.2023 19:41") ' +
                'tai viive ("1v2kk3p4t5m6s")',
        ], 1, 1);
        this.table = new ReminderTable(conn);
    }

    initialise(client: Veikka) {
        this.table.deletePast.run();

        const updateHandler = () => {
            const maxDate = addMilliseconds(new Date(), MAX_TIMER_INTERVAL);
            const futureReminders = this.table.getFutureToDate.all({$epoch: getUnixTime(maxDate)});

            for (const reminder of futureReminders) {
                this.addTimer(client, reminder);
            }
        };

        updateHandler();
        this.updater = setInterval(updateHandler, UPDATE_INTERVAL);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<ReminderCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;
        const {req, opt} = this.listener.parseParameters(event.message);
        const reminderTime = req[0];
        const reminderMsg = opt[0];

        const now = new Date();

        // DURATION
        const duration = parseDuration(reminderTime);
        if (duration) {
            const durationMs = milliseconds({
                years: duration.v,
                months: duration.kk,
                days: duration.p,
                hours: duration.t,
                minutes: duration.m,
                seconds: duration.s,
            });
            const row = this.listener.table.insertOne.get({
                $nick: event.nick,
                $channel: event.target,
                $created_at: getUnixTime(now),
                $reminder_datetime: getUnixTime(addMilliseconds(now, durationMs)),
                $reminder_text: reminderMsg,
            });

            if (row) {
                this.listener.addTimer(this.client, row);
            } else {
                event.reply(this.listener.createSay(
                    'Ääh, jokin meni vikaan.',
                    'Row insert returned null',
                ));
            }

            return;
        }

        // INSTANT
        const instant = parse(reminderTime, FORMAT_DATETIME, now);

        if (!isValid(instant.getTime())) {
            event.reply(this.listener.createSay(
                'Muistutuksen aika on oltava joko muodossa "1v2kk3p4t5m6s" ' +
                'tai "31.10.2023 15:56"',
            ));

            return;
        }

        if (isPast(instant)) {
            event.reply(this.listener.createSay('Annettu aika on menneisyydessä'));

            return;
        }

        const row = this.listener.table.insertOne.get({
            $channel: event.target,
            $nick: event.nick,
            $created_at: getUnixTime(now),
            $reminder_datetime: getUnixTime(instant),
            $reminder_text: reminderMsg,
        });

        if (row) {
            this.listener.addTimer(this.client, row);
        } else {
            event.reply(this.listener.createSay(
                'Ääh, jokin meni vikaan.',
                'Row insert returned null',
            ));
        }
    }

    addTimer(client: Veikka, row: ReminderRow) {
        const handler = () => {
            client.say(row.channel, `Muistutus | ` +
                `${row.reminder_text || 'Ei viestiä'} | ` +
                `${row.nick} | ` +
                `${format(fromUnixTime(row.created_at), FORMAT_DATETIME)}`);

            this.table.deleteOne.run({$id: row.id});
            this.removeTimer(row.id);
        };

        const laterDate = fromUnixTime(row.reminder_datetime);
        const earlierDate = fromUnixTime(row.created_at);
        const timeout = differenceInMilliseconds(laterDate, earlierDate);

        this.timers.push({id: row.id, timer: setTimeout(handler, timeout)});
    }

    removeTimer(id: number) {
        clearTimeout(this.timers.find((t) => t.id === id)?.timer);
        this.timers = this.timers.filter((t) => t.id !== id);
    }

    clearTimers() {
        this.timers.forEach((t) => clearTimeout(t.timer));
    }

    clearUpdater() {
        clearInterval(this.updater);
    }

    close() {
        this.clearUpdater();
        this.clearTimers();
        this.table.finalizeAll();
    }
}

export {ReminderCommand};
