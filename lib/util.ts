import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {Veikka} from 'veikka';

type Context<L> = {
    client: Veikka;
    listener: L;
};

type Initialisable = {
    initialise(client: Veikka): void;
};

function isInitialisable(o: object): o is Initialisable {
    return 'initialise' in o;
}

const INTERVAL = {
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
} as const;

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
    Context,
    Initialisable,
    isInitialisable,
    INTERVAL,
    isEventType,
    useParsedEvents,
    isAdmin,
};
