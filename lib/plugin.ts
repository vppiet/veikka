import {MiddlewareHandler} from 'irc-framework';
import {Veikka} from 'veikka';

type IrcMiddleware = {
    middleware(): (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler)
        => void;
}

export {IrcMiddleware as Plugin};
