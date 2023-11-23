import {Logger} from 'winston';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';

import {getLogger} from '../logger';
import {Veikka} from 'veikka';
import {IrcMiddleware} from 'middleware';

class LogMiddleware implements IrcMiddleware {
    private logger: Logger;

    constructor() {
        this.logger = getLogger('logPlugin');
    }

    middleware() {
        const loggingHandler = (command: string, event: IrcEvent, client: Veikka,
            next: (err?: Error) => void) => {
            if (command === 'pong' && Bun.env['LOG_IGNORE_PONG'] === 'true') {
                return next();
            }

            // ignore 'message' event with 'privmsg' type as duplicate
            if (command === 'message' && 'type' in event && event.type === 'privmsg') {
                return next();
            }

            this.logger.debug({command: command, event: event});
            next();
        };

        return (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
            parsedEvents.use(loggingHandler);
        };
    }
}

export {LogMiddleware};
