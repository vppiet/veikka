import {Client} from 'irc-framework';
import {IrcClientOptions} from '../types/irc-framework/client';

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
        this.client = new Client();
        this.setDefaultOptions();
    }

    /**
     * Connects to the IRC server.
     * @param {VeikkaConnectionOptions} connectionOptions Connection options
     */
    connect(connectionOptions: VeikkaConnectionOptions): void {
        return;
    }

    /**
     * Gets options.
     * @return {void} Options
     */
    getOptions(): VeikkaOptions | undefined {
        return this.options;
    }

    /**
     * Tells if client is connected to a server.
     * @return {boolean} Whether client is connected
     */
    isConnected(): boolean {
        return this.client.connected;
    }

    /** Sets default options for nick, gecos, and username. */
    protected setDefaultOptions(): void {
        if (!this.options) {
            this.options = {};
        }

        const props = Object.keys(Veikka.DEFAULT_OPTIONS) as
            Array<keyof typeof Veikka.DEFAULT_OPTIONS>;

        for (const prop of props) {
            if (Object.hasOwn(this.options, prop)) {
                this.options[prop] = this.options[prop] ?
                    this.options[prop] : Veikka.DEFAULT_OPTIONS[prop];
            } else {
                this.options[prop] = Veikka.DEFAULT_OPTIONS[prop];
            }
        }

        return;
    }
}

export {VeikkaOptions, Veikka};
