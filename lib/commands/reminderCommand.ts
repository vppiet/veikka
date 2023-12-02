import {PrivMsgEvent} from 'irc-framework';
import {milliseconds, parse, isValid, isPast, addMilliseconds, format,
    getUnixTime, differenceInMilliseconds, formatDistance} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import {fi} from 'date-fns/locale';

import {Command, Params} from '../command';
import {Closeable, INTERVAL, Initialisable} from '../util';
import {Veikka} from '../veikka';
import {ReminderRow, ReminderTable} from '../db/reminder';
import Database from 'bun:sqlite';

const FORMAT_DATETIME = 'd.M.yyyy \'klo\' HH:mm';
const UPDATE_INTERVAL = 29 * INTERVAL.MINUTE;
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

function formatForReply(reminderDate: Date, baseDate: Date) {
    return format(reminderDate, FORMAT_DATETIME) +
        ` (${formatDistance(reminderDate, baseDate, {addSuffix: true, locale: fi})})`;
}

class ReminderCommand extends Command implements Initialisable, Closeable {
    timers: ReminderTimer[] = [];
    table: ReminderTable;
    updater?: Timer;

    constructor(conn: Database) {
        super('.', 'muistutus', [
            '.muistutus <aika>, [viesti]',
            'Aseta itsellesi muistutus.',
            'Aika-argumentti voi olla joko ajankohta ("31.10.2023 klo 15:56") ' +
                'tai viive ("1v2kk3p4t5m6s")',
        ], 1, 1);
        this.table = new ReminderTable(conn);
    }

    initialise(client: Veikka) {
        this.table.deletePast.run();

        const updateHandler = () => {
            const maxDate = addMilliseconds(new Date(), MAX_TIMER_INTERVAL);
            const futureReminders = this.table.getFutureToDate.all({
                $max_epoch: getUnixTime(maxDate),
            });

            for (const reminder of futureReminders) {
                this.addTimer(client, reminder);
            }
        };

        updateHandler();
        this.updater = setInterval(updateHandler, UPDATE_INTERVAL);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka): void {
        const reminderTime = params.req[0];
        const reminderMsg = params.opt[0];

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
            const reminderDateTime = addMilliseconds(now, durationMs);
            const row = this.table.insertOne.get({
                $nick: event.nick,
                $target: event.target === client.user.nick ? event.nick : event.target,
                $created_at: getUnixTime(now),
                $reminder_datetime: getUnixTime(reminderDateTime),
                // eslint-disable-next-line new-cap
                $reminder_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
                $reminder_text: reminderMsg,
            });

            if (row) {
                this.addTimer(client, row);
                event.reply(this.createSay(
                    `Muistutus asetettu ajankohtaan ${formatForReply(reminderDateTime, now)}`,
                ));
            } else {
                event.reply(this.createSay(
                    'Ääh, jokin meni vikaan.',
                    'Row insert returned null',
                ));
            }

            return;
        }

        // INSTANT
        const instant = parse(reminderTime, FORMAT_DATETIME, now);

        if (!isValid(instant.getTime())) {
            event.reply(this.createSay(
                'Muistutuksen aika on oltava joko muodossa "1v2kk3p4t5m6s" ' +
                'tai "31.10.2023 klo 15:56"',
            ));

            return;
        }

        if (isPast(instant)) {
            event.reply(this.createSay('Ajankohta on menneisyydessä'));

            return;
        }

        const row = this.table.insertOne.get({
            $nick: event.nick,
            $target: event.target === client.user.nick ? event.nick : event.target,
            $created_at: getUnixTime(now),
            $reminder_datetime: getUnixTime(instant),
            // eslint-disable-next-line new-cap
            $reminder_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            $reminder_text: reminderMsg,
        });

        if (row) {
            this.addTimer(client, row);
            event.reply(this.createSay(
                `Muistutus asetettu ajankohtaan ${formatForReply(instant, now)}`,
            ));
        } else {
            event.reply(this.createSay(
                'Ääh, jokin meni vikaan.',
                'Row insert returned null',
            ));
        }
    }

    addTimer(client: Veikka, row: ReminderRow) {
        const handler = () => {
            const msg = row.reminder_text ? `"${row.reminder_text}"` : 'Ei viestiä';
            client.say(row.target, this.createSay(
                msg,
                `Luonut ${row.nick} ajankohdassa ${format(utcToZonedTime(row.created_at * 1000,
                    row.reminder_tz), FORMAT_DATETIME)}`,
            ));

            this.table.deleteOne.run({$id: row.id});
            this.removeTimer(row.id);
        };

        const laterDate = utcToZonedTime(row.reminder_datetime * 1000, row.reminder_tz);
        const earlierDate = utcToZonedTime(row.created_at * 1000, row.reminder_tz);
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
