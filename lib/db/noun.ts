import Database, {Statement} from 'bun:sqlite';
import {resolve} from 'node:path';
import {Logger} from 'winston';

import {getLogger} from 'logger';
import {getCacheDir} from '../util';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS noun(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    word TEXT NOT NULL UNIQUE
);`;

interface NounRow {
    id: number;
    word: string;
}

class NounTable {
    logger: Logger;
    getAllByBegin: Statement<NounRow, string[]>;
    getCount: Statement<{count: number}, never[]>;
    insertOne: Statement<never, string[]>;
    insertMany: ReturnType<Database['transaction']>;

    constructor(conn: Database) {
        this.logger = getLogger('NounTable');
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
            'INSERT OR IGNORE INTO noun(word) ' +
            'VALUES (?1)',
        );
        this.insertMany = conn.transaction((words: string[]) => {
            for (const word of words) {
                this.insertOne.run(word);
            }

            return words.length;
        });
    }

    async loadWords() {
        const count = this.getCount.get()?.count ?? 0;

        this.logger.debug(`${count} nouns in the database.`);

        if (count > 0) {
            this.logger.debug('At least one noun exists; not loading the external word list');
            return;
        }

        const cacheDirPath = await getCacheDir();
        const filePath = resolve(cacheDirPath, 'nouns.txt');
        const nounsFile = Bun.file(filePath);
        let text: string | undefined;
        let words: string[] | undefined;

        if (!await nounsFile.exists()) {
            this.logger.debug(`Nouns file not found in ${filePath}, downloading`);

            // eslint-disable-next-line max-len
            const response = await fetch('https://raw.githubusercontent.com/akx/fi-words/master/words/nouns.txt');

            if (!response.ok) {
                this.logger.error(`Could not download Finnish word list (${response.status})`);
                return;
            }

            text = await response.text();
            const bytes = await Bun.write(filePath, text);
            this.logger.debug(`Wrote ${bytes} bytes to ${filePath}`);
        } else {
            this.logger.debug(`Nouns file found in ${filePath}, reading`);
            text = await nounsFile.text();
            this.logger.debug(`Loaded ${nounsFile.size} bytes from ${filePath}`);
        }

        words = text.replaceAll('=', '')
            .split('\n')
            // filter empty lines and some anomalies in word list
            .filter((w) => w && !['san'].includes(w.toLowerCase()));
        text = undefined;

        // TODO: transaction function: somehow not finalized/garbage collected
        const insertCount: number = this.insertMany(words);
        this.logger.debug(`Inserted ${insertCount} rows.`);

        words = undefined;
    }

    finalizeAll() {
        this.getAllByBegin.finalize();
        this.getCount.finalize();
        this.insertOne.finalize();
    }
}

export {NounRow, NounTable};
