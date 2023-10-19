import {IrcEvent, MiddlewareHandler, User} from 'irc-framework';
import {Veikka} from 'veikka';

type Closeable = {
    close(): void;
};

type Initialisable = {
    initialise(): void;
};

type IrcMiddleware = {
    middleware(): void;
}

function isEventType<T extends IrcEvent>(actualCmd: string, expectedCmd: string,
    event: IrcEvent): event is T {
    return actualCmd.toLowerCase() === expectedCmd.toLowerCase();
}

function useParsedEvents(handler: (command: string, event: IrcEvent, client: Veikka,
    next: (err?: Error) => void) => void) {
    return function(client: Veikka, rawEvents: MiddlewareHandler,
        parsedEvents: MiddlewareHandler) {
        parsedEvents.use(handler);
    };
}

function isAdmin(ident: string, hostname: string) {
    return ident + '@' + hostname === Bun.env['ADMIN_MASK'];
}

export {
    Closeable,
    Initialisable,
    isEventType,
    useParsedEvents,
    isAdmin,
};
