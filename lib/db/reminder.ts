import Database, {Statement} from 'bun:sqlite';

const SCHEMA =
`CREATE TABLE IF NOT EXISTS reminder(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    nick TEXT NOT NULL,
    channel TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    reminder_datetime INTEGER NOT NULL,
    reminder_text TEXT
);`;

type ReminderRow = {
    id: number;
    nick: string;
    channel: string;
    created_at: number;
    reminder_datetime: number;
    reminder_text?: string;
};

class ReminderTable {
    getFutureToDate: Statement<ReminderRow, {$epoch: number}[]>;
    insertOne: Statement<ReminderRow, {
        $nick: string;
        $channel: string;
        $created_at: number;
        $reminder_datetime: number;
        $reminder_text?: string;
    }[]>;
    deletePast: Statement<never, never[]>;
    deleteOne: Statement<never, {
        $id: number;
    }[]>;

    constructor(conn: Database) {
        conn.run(SCHEMA);
        this.getFutureToDate = conn.query(
            'SELECT id, nick, channel, created_at, reminder_datetime, reminder_text ' +
            'FROM reminder ' +
            'WHERE unixepoch(reminder_datetime) > unixepoch()',
        );
        this.insertOne = conn.query(
            'INSERT INTO reminder(nick, channel, created_at, reminder_datetime, ' +
            'reminder_text) ' +
            'VALUES ($nick, $channel, $created_at, $reminder_datetime, $reminder_text) ' +
            'RETURNING *',
        );
        this.deletePast = conn.query(
            'DELETE FROM reminder WHERE unixepoch() >= reminder_datetime',
        );
        this.deleteOne = conn.query(
            'DELETE FROM reminder WHERE id = $id',
        );
    }

    finalizeAll() {
        this.getFutureToDate.finalize();
        this.insertOne.finalize();
        this.deletePast.finalize();
        this.deleteOne.finalize();
    }
}

export {ReminderRow, ReminderTable};
