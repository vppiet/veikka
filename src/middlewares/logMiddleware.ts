import {Logger} from 'winston';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';

import {getLogger} from '../logger';
import {Veikka} from 'veikka';
import {IrcMiddleware} from 'middleware';

const ONLY_ON_DEBUG_LEVEL = ['ping', 'pong', 'privmsg', 'message', 'mode', 'userlist'];

class LogMiddleware implements IrcMiddleware {
    private logger: Logger;

    constructor() {
        this.logger = getLogger('logMiddleware');
    }

    middleware() {
        const loggingHandler = (command: string, event: IrcEvent, client: Veikka,
            next: (err?: Error) => void) => {
            if (ONLY_ON_DEBUG_LEVEL.includes(command)) {
                this.logger.debug({command, event});
            } else {
                this.logger.info({command, event});
            }

            next();
        };

        return (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
            parsedEvents.use(loggingHandler);
        };
    }
}

export {LogMiddleware};
