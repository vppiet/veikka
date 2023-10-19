import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {getLogger} from '../logger.js';
import {Veikka} from '../veikka.js';

const log = getLogger('logging middleware');

const loggingHandler = (command: string, event: IrcEvent, client: Veikka,
    next: (err?: Error) => void) => {
    log.info({command: command, event: event});

    next();
};

const loggingMiddleware = () => {
    return (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
        parsedEvents.use(loggingHandler);
    };
};

export {loggingMiddleware};
