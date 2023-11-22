import Database, {Statement} from 'bun:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS noun(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    word TEXT NOT NULL
);`;

type NounRow = {
    id: number;
    word: string;
};

class NounTable {
    getAllByBegin: Statement<NounRow, string[]>;
    getCount: Statement<{count: number}, never[]>;
    insertOne: Statement<never, string[]>;
    insertMany: ReturnType<Database['transaction']>;

    constructor(conn: Database) {
        conn.run(SCHEMA);

        this.getAllByBegin = conn.query(
            'SELECT word ' +
            'FROM noun ' +
            'WHERE word LIKE ?1 || "%"',
        );
        this.getCount = conn.query(
            'SELECT COUNT() as count ' +
            'FROM noun',
        );
        this.insertOne = conn.query(
            'INSERT INTO noun(word) ' +
            'VALUES (?1)',
        );
        this.insertMany = conn.transaction((words: string[]) => {
            for (const word of words) {
                this.insertOne.run(word);
            }

            return words.length;
        });
    }

    finalizeAll() {
        this.getAllByBegin.finalize();
        this.getCount.finalize();
        this.insertOne.finalize();
    }
}

export {NounRow, NounTable};
