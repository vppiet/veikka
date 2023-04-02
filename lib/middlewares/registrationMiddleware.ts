import {Client, IrcMiddleware, RegisteredEvent} from 'irc-framework';
import MiddlewareHandler from 'middleware-handler';

import {getLogger} from '../logger.js';

const log = getLogger('registration middleware');

function registrationMiddleware(): IrcMiddleware {
    return function(
        client: Client,
        rawEvents: MiddlewareHandler,
        parsedEvents: MiddlewareHandler) {
        parsedEvents.use(handler);
    };
}

function handler(command: string, event: RegisteredEvent, client: Client,
    next: () => void) {
    if (command === 'registered') {
        log.info(`Registered as nick '${event.nick}'`);

        client.join('#veikka');
    }

    next();
}

export {registrationMiddleware};
