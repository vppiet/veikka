import {Logger} from 'winston';
import {Database} from 'bun:sqlite';
import {Channel, Client, IrcClientOptions} from 'irc-framework';

import {Command} from './command';
import {Publisher} from './publisher';
import {Initialisable, isType} from './util';
import coreListeners from './coreListeners';
import {getLogger} from 'logger';

class Veikka extends Client {
    logger: Logger;
    db: Database;
    commands: Command[] = [];
    channels: Channel[] = [];
    publishers: Publisher[] = [];

    private constructor(db: Database, options?: IrcClientOptions) {
        super(options);
        this.logger = getLogger('Veikka');
        this.db = db;
        this.addCoreListeners();
    }

    static async create(options?: IrcClientOptions) {
        const db = new Database('db.sqlite', {create: true});
        db.exec('PRAGMA journal_mode = WAL;');
        db.exec('PRAGMA foreign_keys = ON;');

        process.on('exit', () => db.close());

        return new Veikka(db, options);
    }

    addCommand(...cmds: Command[]) {
        cmds.forEach((c) => {
            this.addListener(c.getEventName(), c.listener, {client: this, listener: c});

            if (isType<Initialisable, Command>(c, ['initialise'])) {
                c.initialise(this);
            }

            this.commands.push(c);
        });

        return this;
    }

    addPublisher(publisher: Publisher) {
        this.addListener(publisher.getEventName(), publisher.listener,
            {client: this, listener: publisher});
        this.publishers.push(publisher);

        return this;
    }

    private addCoreListeners() {
        for (const CoreListener of coreListeners) {
            const l = new CoreListener();
            this.addListener(l.getEventName(), l.listener, {client: this, listener: l});
        }
    }
}

export {Veikka};
