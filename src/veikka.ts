import {Database} from 'bun:sqlite';
import {
    Channel,
    Client,
    IrcClientOptions, JoinEvent, RegisteredEvent
} from 'irc-framework';
import {Logger} from 'winston';

import {Command} from './command';
import {getLogger} from './logger';
import networks from './networks';
import {Service} from './service';
import {Closeable, Initialisable, isType} from './util';

class Veikka extends Client {
    logger: Logger;
    db: Database;
    commands: Command<unknown>[] = [];
    channels: Channel[] = [];
    services: Service[] = [];

    private constructor(db: Database, options?: IrcClientOptions) {
        super(options);
        this.logger = getLogger('Veikka');
        this.db = db;
        this.addCoreListeners();
    }

    static create(options?: IrcClientOptions) {
        const db = new Database('db.sqlite', {create: true});
        db.exec('PRAGMA journal_mode = WAL;');
        db.exec('PRAGMA foreign_keys = ON;');

        process.on('exit', () => { db.close(); });

        return new Veikka(db, options);
    }

    addCommand<T>(...cmds: Command<T>[]) {
        cmds.forEach((c) => {
            const listenerBound = c.listener.bind({client: this, listener: c})
            this.addListener(c.eventName, listenerBound);

            if (isType<Initialisable, Command<T>>(c, ['initialise'])) {
                c.initialise(this);
            }

            this.commands.push(c);
        });

        return this;
    }

    private addCoreListeners() {
        this.on('registered', (event: RegisteredEvent) => {
            this.on('network services', networkServicesListener);
            this.logger.info(`Registered as ${event.nick}`);

            const domain = this.options.host?.split('.').slice(-2).join('.');

            if (domain && Object.keys(networks).includes(domain)) {
                networks[domain].handler(this);
            } else {
                this.emit('network services');
            }
        });

        const networkServicesListener = () => {
            Bun.env.SERVER_AUTOJOIN?.split(', ').forEach((c) => { this.join(c); });
            this.removeListener('network services', networkServicesListener);
        };

        this.on('debug', (msg: string) => {
            this.logger.debug(msg);
        });

        this.on('join', (event: JoinEvent) => {
            if (event.nick == this.user.nick) {
                this.channels.push(this.channel(event.channel));

                this.logger.info(`Joined channel ${event.channel}`);
            }
        });

        this.on('socket close', () => {
            this.logger.info(`Socket closed`);
            this.channels = [];
            this.commands
                .filter((c): c is Command<unknown> & Closeable => isType(c, ['close']))
                .forEach((c) => { c.close(this); });
        });
    }
}

export {Veikka};
