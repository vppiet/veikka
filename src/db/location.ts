import Database, {Statement} from 'bun:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS location(
    name TEXT PRIMARY KEY NOT NULL,
    json TEXT,
    created_at INTEGER NOT NULL
);`;

interface LocationRow {
    name: string;
    json: string;
    created_at: number;
}

class LocationTable {
    getOne: Statement<LocationRow, {$name: string}[]>;
    insertOne: Statement<undefined, {$name: string; $json: string}[]>;

    constructor(conn: Database) {
        conn.run(SCHEMA);

        this.getOne = conn.query('SELECT name, json, created_at FROM location WHERE name = $name');
        this.insertOne = conn.query(
            'INSERT INTO location(name, json, created_at) VALUES ($name, $json, unixepoch())'
        );
    }

    finalizeAll() {
        this.getOne.finalize();
        this.insertOne.finalize();
    }
}

export {LocationTable};
export type {LocationRow};
