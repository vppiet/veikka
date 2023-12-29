import {Database} from 'bun:sqlite';
import {
    Channel,
    Client,
    IrcClientOptions,
    JoinEvent,
    NickInUseEvent,
    RegisteredEvent,
} from 'irc-framework';
import {Logger} from 'winston';

import {Command} from './command';
import {getLogger} from './logger';
import NETWORKS from './network';
import {Service} from './service';
import {Closeable, isCloseable, isInitialisable, isServiceType} from './util';

class Veikka extends Client {
    logger: Logger;
    db: Database;
    commands: Command<unknown[]>[] = [];
    channels: Channel[] = [];
    services: Record<symbol, Service | undefined> = {};

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

        process.on('exit', () => {
            db.close();
        });

        return new Veikka(db, options);
    }

    addCommand<T extends unknown[]>(cmd: Command<T>) {
        this.addListener(cmd.eventName, cmd.listener, {client: this, listener: cmd});
        if (isInitialisable(cmd)) {
            cmd.initialise(this);
        }

        this.commands.push(cmd);

        return this;
    }

    addService(service: Service) {
        this.services[service.id] = service;
    }

    getService<T extends Service>(id: symbol): T | undefined {
        const service = this.services[id];
        return isServiceType<T>(service, id) ? service : undefined;
    }

    private addCoreListeners() {
        this.on('registered', (event: RegisteredEvent) => {
            this.on('network services', networkServicesListener);
            this.logger.info(`Registered as ${event.nick}`);

            const domain = this.options.host?.split('.').slice(-2).join('.');

            if (domain && Object.keys(NETWORKS).includes(domain)) {
                NETWORKS[domain].onRegistered(this);
            } else {
                this.emit('network services');
            }
        });

        const networkServicesListener = () => {
            Bun.env.SERVER_AUTOJOIN?.split(', ').forEach((c) => {
                this.join(c);
            });
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
                .filter((c): c is Command<unknown[]> & Closeable => isCloseable(c))
                .forEach((c) => {
                    c.close(this);
                });
        });

        const nickPostfixes = ['_', '-', '^'];
        let postFixIndex = 0;

        this.on('nick in use', (event: NickInUseEvent) => {
            if (postFixIndex === nickPostfixes.length - 1) {
                this.quit();
            }

            const lastChar = event.nick[event.nick.length - 1];
            const i = nickPostfixes.indexOf(lastChar);
            let altNick = event.nick;

            if (i === -1) {
                altNick += nickPostfixes[0];
            } else {
                altNick = event.nick.slice(0, event.nick.length - 1) + nickPostfixes[postFixIndex];
            }

            postFixIndex++;

            this.logger.info('Requesting nick change to ' + altNick);
            this.changeNick(altNick);
        });
    }
}

export {Veikka};
