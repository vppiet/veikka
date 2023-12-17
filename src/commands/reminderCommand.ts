import {
    add,
    addMilliseconds,
    differenceInMilliseconds,
    format,
    formatDistance,
    getUnixTime,
    isPast
} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import {fi} from 'date-fns/locale';
import {PrivMsgEvent} from 'irc-framework';

import Database from 'bun:sqlite';
import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseDateTime, parseDuration} from '../commandParamParsers/dateParam';
import {parseStringTail} from '../commandParamParsers/stringParam';
import {ReminderRow, ReminderTable} from '../db/reminder';
import {Closeable, Initialisable} from '../util';
import {Veikka} from '../veikka';
import {DATETIME_FORMAT, INTERVAL} from './resources/time';

const UPDATE_INTERVAL = 29 * INTERVAL.MINUTE;
const MAX_TIMER_INTERVAL = INTERVAL.HOUR;

interface ReminderTimer {
    id?: number;
    timer: Timer;
}

class ReminderCommand extends Command<Date | string> implements Initialisable, Closeable {
    timers: ReminderTimer[] = [];
    table: ReminderTable;
    updater?: Timer;

    constructor(conn: Database) {
        super('.', 'muistutus', [
            '.muistutus <aikamääre>, [viesti]',
            'Aseta itsellesi muistutus.',
            'Aikamääre voi olla joko ajankohta ("31.10.2023 klo 15:56") ' +
                'tai viive ("1v2kk3p4t5m6s")',
        ], [datetimeParam, msgParam]);
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

    eventHandler(event: PrivMsgEvent, params: [Date, string], client: Veikka): void {
        const [reminderDate, reminderMsg] = params;

        if (isPast(reminderDate)) {
            this.reply(event, 'Aika on menneisyydessä');
            return;
        }

        const now = new Date();

        const row = this.table.insertOne.get({
            $nick: event.nick,
            $target: event.target === client.user.nick ? event.nick : event.target,
            $created_at: getUnixTime(now),
            $reminder_datetime: getUnixTime(reminderDate),
            // eslint-disable-next-line new-cap
            $reminder_tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            $reminder_text: reminderMsg,
        });

        if (row) {
            this.addTimer(client, row);
            this.reply(event,
                `Muistutus asetettu ajankohtaan ${this.formatForReply(reminderDate, now)}`,
            );
        } else {
            this.reply(event, 'Odottamaton virhe: muistutusta ei pystytty tallentamaan');
        }
    }

    formatForReply(reminderDate: Date, baseDate: Date) {
        return format(reminderDate, DATETIME_FORMAT) +
            ` (${formatDistance(reminderDate, baseDate, {addSuffix: true, locale: fi})})`;
    }

    addTimer(client: Veikka, row: ReminderRow) {
        const handler = () => {
            const msg = row.reminder_text ? `"${row.reminder_text}"` : 'Ei viestiä';
            client.say(row.target, this.createSay(
                msg,
                `Luonut ${row.nick}`,
                `${format(
                    utcToZonedTime(row.created_at * 1000, row.reminder_tz),
                    DATETIME_FORMAT,
                )}`,
            ));

            this.table.deleteOne.run({$id: row.id});
            this.removeTimer(row.id);
        };

        const reminderDate = utcToZonedTime(row.reminder_datetime * 1000, row.reminder_tz);
        const now = new Date();
        const timeout = differenceInMilliseconds(reminderDate, now);

        this.timers.push({id: row.id, timer: setTimeout(handler, timeout)});
    }

    removeTimer(id: number) {
        clearTimeout(this.timers.find((t) => t.id === id)?.timer);
        this.timers = this.timers.filter((t) => t.id !== id);
    }

    clearTimers() {
        this.timers.forEach((t) => {
            clearTimeout(t.timer);
        });
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

const datetimeParam: CommandParam<Date> = {
    name: 'aikamääre',
    required: true,
    parse: function(parts: string[]) {
        const now = new Date();

        // timestamp & daydelta
        const datetime = parseDateTime(parts, now);
        if ('value' in datetime) {
            return {value: datetime.value, consumed: datetime.consumed};
        }

        // duration
        const duration = parseDuration(parts);
        if ('value' in duration) {
            const reminderDateTime = add(now, duration.value);

            return {value: reminderDateTime, consumed: duration.consumed};
        }

        return {error: 'Aikamäärettä ei voitu tulkita'};
    },
};

const msgParam: CommandParam<string> = {
    name: 'viesti',
    required: true,
    parse: parseStringTail,
};

export {ReminderCommand};
