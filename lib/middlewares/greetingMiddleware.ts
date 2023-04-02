import {Client, IrcMiddleware, RegisteredEvent} from 'irc-framework';
import MiddlewareHandler from 'middleware-handler';

import {getLogger} from '../logger.js';
import {DotCommand} from '../dotCommand.js';

const log = getLogger('greeting middleware');

const BASE = '.moi';
const dotCommand = new DotCommand(BASE);

function greetingMiddleware(): IrcMiddleware {
    return function(
        client: Client,
        rawEvents: MiddlewareHandler,
        parsedEvents: MiddlewareHandler) {
        parsedEvents.use(handler);
    };
}

function handler(command: string, event: any, client: Client,
    next: () => void) {
    if (command === 'privmsg' && event.message.match(/^.moi/)) {
        event.reply(`Moi ${event.nick}!`);
    }

    if (command === 'privmsg' && event.message.match(/^.poistu/)) {
        client.quit('Heippa!');
    }

    next();
}

export {greetingMiddleware};
