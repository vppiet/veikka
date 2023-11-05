import Database, {Statement} from 'bun:sqlite';

type ReminderRow = {
    id: number;
    nick: string;
    channel: string;
    created_at: string;
    reminder_datetime: string;
    reminder_text?: string;
};

class ReminderTable {
    stmts: {
        GET_FUTURE: Statement<ReminderRow, never[]>,
        INSERT_ONE: Statement<{id: number}, {
            $nick: string;
            $channel: string;
            $created_at: string;
            $reminder_datetime: string;
            $reminder_text?: string;
        }[]>,
        DELETE_OLD: Statement<never, never[]>,
        DELETE_ONE: Statement<never, {
            $id: number;
            $nick: string;
            $channel: string;
        }[]>
    };

    constructor(conn: Database) {
        this.stmts = {
            GET_FUTURE: conn.prepare(
                'SELECT id, nick, channel, created_at, reminder_datetime, reminder_text ' +
                'FROM reminder ' +
                'WHERE unixepoch(reminder_datetime) > unixepoch()',
            ),
            INSERT_ONE: conn.prepare(
                'INSERT INTO reminder(nick, channel, created_at, reminder_datetime, ' +
                'reminder_text) ' +
                'VALUES ($nick, $channel, $created_at, $reminder_datetime, $reminder_text) ' +
                'RETURNING id'),
            DELETE_OLD: conn.prepare(
                'DELETE FROM reminder WHERE unixepoch(reminder_datetime) <= unixepoch()',
            ),
            DELETE_ONE: conn.prepare(
                'DELETE FROM reminder WHERE id = $id AND nick = $nick AND channel = $channel',
            ),
        };
    }

    getFuture() {
        return this.stmts.GET_FUTURE.all();
    }

    insertOne(nick: string, channel: string, createdAt: string, reminderDatetime: string,
        reminderText: string) {
        return this.stmts.INSERT_ONE.get({
            $nick: nick,
            $channel: channel,
            $created_at: createdAt,
            $reminder_datetime: reminderDatetime,
            $reminder_text: reminderText,
        });
    }

    deletePast() {
        this.stmts.DELETE_OLD.run();
    }

    deleteOne(id: number, nick: string, channel: string) {
        this.stmts.DELETE_ONE.run({
            $id: id,
            $nick: nick,
            $channel: channel,
        });
    }
}

export {ReminderRow, ReminderTable};
