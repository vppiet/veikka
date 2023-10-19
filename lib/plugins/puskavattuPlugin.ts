import {IrcEvent, MiddlewareHandler, PrivMsgEvent} from 'irc-framework';
import {Plugin} from 'plugin';
import {isEventType} from '../util';
import {Veikka} from 'veikka';

class PuskavattuPlugin implements Plugin {
    middleware() {
        const handler = (cmd: string, event: IrcEvent, client: Veikka,
            next: (err?: Error) => void) => {
            if (!isEventType<PrivMsgEvent>(cmd, 'privmsg', event)) {
                return next();
            }

            if (event.message.trim().toLowerCase() !== 'laita mode') {
                return next();
            }

            client.addListener('mode', () => {
                console.log(`MODES AFTER: ${Array.from(client.user.modes).join(', ')}`);
                client.whois(client.user.nick);
            });

            console.log(`MODES BEFORE: ${Array.from(client.user.modes).join(', ')}`);
            client.whois(client.user.nick);
            // client.mode(client.user.nick, '+i');
        };

        return (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
            parsedEvents.use(handler);
        };
    }
}

export {PuskavattuPlugin};
