import dotenv from 'dotenv';
import {Client} from 'irc-framework';
import {Logger} from 'winston';

import {setDefaultEnvironment} from './environment.js';
import {IrcClientOptions} from '../types/irc-framework/client.js';
import {MiddlewareRegister} from './middlewareRegister.js';
import {getLogger} from './logger.js';

dotenv.config();
setDefaultEnvironment();

type VeikkaOptions = Pick<IrcClientOptions, 'nick' | 'username' | 'gecos'>;

interface VeikkaConnectionOptions {
    host: string;
    port: number;
}

/**
 * Represents an IRC bot.
 */
class Veikka {
    protected options?: VeikkaOptions;
    protected client: Client;
    protected middlewareRegister: MiddlewareRegister;
    public log: Logger;

    static readonly DEFAULT_OPTIONS: VeikkaOptions = {
        nick: 'veikka',
        username: 'veikka',
        gecos: 'Veikka',
    };

    /**
     * Create a Veikka.
     * @param {VeikkaOptions} options Options
     */
    constructor(options?: VeikkaOptions) {
        this.options = options;
        this.setDefaultOptions();

        this.client = new Client(this.options);
        this.middlewareRegister = new MiddlewareRegister();
        this.log = getLogger('veikka');
    }

    /**
     * Connects to the IRC server.
     * @param {VeikkaConnectionOptions} opts Connection options
     */
    connect(opts: VeikkaConnectionOptions): void {
        this.client.connect({...this.options, ...opts});
    }

    getClient(): Client {
        return this.client;
    }

    /**
     * Gets options.
     * @return {VeikkaOptions?} Options
     */
    getOptions(): VeikkaOptions | undefined {
        return this.options;
    }

    getRegister(): MiddlewareRegister {
        return this.middlewareRegister;
    }

    /**
     * Tells if client is connected to a server.
     * @return {boolean} Whether client is connected
     */
    isConnected(): boolean {
        return this.client.connected;
    }

    /**
     * Sets default options for nick, gecos, and username.
     */
    protected setDefaultOptions(): void {
        if (!this.options) {
            this.options = {};
        }

        const props = Object.keys(Veikka.DEFAULT_OPTIONS) as
            Array<keyof typeof Veikka.DEFAULT_OPTIONS>;

        for (const prop of props) {
            this.options[prop] = this.options[prop] ?
                this.options[prop] : Veikka.DEFAULT_OPTIONS[prop];
        }

        return;
    }
}

export {VeikkaOptions, VeikkaConnectionOptions, Veikka};
