import {Client, IrcMiddleware, RegisteredEvent} from 'irc-framework';
import MiddlewareHandler from 'middleware-handler';

import {getLogger} from '../logger.js';

const log = getLogger('logging middleware');

function loggingMiddleware(): IrcMiddleware {
    return function(
        client: Client,
        rawEvents: MiddlewareHandler,
        parsedEvents: MiddlewareHandler) {
        parsedEvents.use(handler);
    };
}

function handler(command: string, event: unknown, client: Client,
    next: () => void) {
    log.info({
        command: command,
        event: event,
    });
    next();
}

export {loggingMiddleware};
