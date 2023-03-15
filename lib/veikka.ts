import {Client} from 'irc-framework';

interface VeikkaOptions {
    host: string,
    port: number
}

/**
 * Represents an IRC bot.
 */
class Veikka {
    options: VeikkaOptions;
    client: Client;

    static NAME = 'Veikka';

    /**
     * Create a Veikka.
     * @param {VeikkaOptions} options Options
     */
    constructor(options: VeikkaOptions) {
        this.options = options;
        this.client = new Client();
    }

    /**
     * Gets options.
     * @return {VeikkaOptions} Options
     */
    getOptions(): VeikkaOptions {
        return this.options;
    }

    /**
     * Tells if client is connected to a server.
     * @return {boolean} Flag whether client is connected
     */
    isConnected(): boolean {
        return false;
    }
}

export {VeikkaOptions, Veikka};
