import Database, {Statement} from 'bun:sqlite';

const SCHEMA =
`CREATE TABLE IF NOT EXISTS reminder(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    nick TEXT NOT NULL,
    target TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    reminder_datetime INTEGER NOT NULL,
    reminder_tz TEXT NOT NULL,
    reminder_text TEXT
);`;

type ReminderRow = {
    id: number;
    nick: string;
    target: string;
    created_at: number;
    reminder_datetime: number;
    reminder_tz: string;
    reminder_text?: string;
};

type InsertOneParams = {
    [P in keyof Omit<ReminderRow, 'id'> as `$${P}`]: ReminderRow[P]
};

class ReminderTable {
    getFutureToDate: Statement<ReminderRow, {$max_epoch: number}[]>;
    insertOne: Statement<ReminderRow, InsertOneParams[]>;
    deletePast: Statement<never, never[]>;
    deleteOne: Statement<never, {
        $id: number;
    }[]>;

    constructor(conn: Database) {
        conn.run(SCHEMA);

        this.getFutureToDate = conn.query(
            'SELECT id, nick, target, created_at, reminder_datetime, reminder_tz, ' +
            'reminder_text ' +
            'FROM reminder ' +
            'WHERE ' +
            'reminder_datetime > unixepoch() AND ' +
            'reminder_datetime < $max_epoch',
        );
        this.insertOne = conn.query(
            'INSERT INTO reminder(nick, target, created_at, reminder_datetime, ' +
            'reminder_tz, reminder_text) ' +
            'VALUES ($nick, $target, $created_at, $reminder_datetime, $reminder_tz, ' +
            '$reminder_text) ' +
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
