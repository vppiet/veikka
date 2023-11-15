import {Statement} from 'bun:sqlite';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {Veikka} from './veikka';

type Context<L> = {
    client: Veikka;
    listener: L;
};

type Initialisable = {
    initialise(client: Veikka): void;
};

interface Closeable {
    close(client: Veikka): void;
}

function isType<T extends object, U extends object>(o: U, props: string[]): o is T & U {
    return props.every((p) => p in o);
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

function capitalize(input: string) {
    return input[0].toUpperCase() + input.slice(1);
}

function finalizeAll(stmts: Record<string, Statement>) {
    for (const stmt of Object.values(stmts)) {
        stmt.finalize();
    }
}

function peek<T>(arr: T[], i: number) {
    return arr[i+1];
}

type PropertyValue<T extends Record<PropertyKey, unknown>> = T[keyof T];

export {
    Context,
    Initialisable,
    Closeable,
    isType,
    INTERVAL,
    isEventType,
    useParsedEvents,
    isAdmin,
    capitalize,
    finalizeAll,
    peek,
    PropertyValue,
};
