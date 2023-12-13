import { MiddlewareHandler } from './types/irc-framework/irc-framework';
import { Veikka } from './veikka';

interface IrcMiddleware {
    middleware(): (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler)
        => void;
}

export { IrcMiddleware };

