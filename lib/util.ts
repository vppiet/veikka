import {Statement} from 'bun:sqlite';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {resolve} from 'path';
import {mkdir} from 'fs/promises';

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

type PropertyValue<T extends Record<PropertyKey, unknown>> = T[keyof T];

const INTERVAL = {
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
} as const;

function isType<T extends object, U extends object>(o: U, props: string[]): o is T & U {
    return props.every((p) => p in o);
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

function round(value: number, decPlaces = 2) {
    // max supported decimal places
    if (decPlaces > 10) decPlaces = 10;

    // num->str->num->str->num, ehh... good for now
    const str = String(value) + 'e' + decPlaces;
    const num = Math.round(Number(str));
    return Number(String(num) + 'e' + -decPlaces);
}

async function getCacheDir() {
    const path = resolve(process.cwd(), 'cache/');

    try {
        await mkdir(path);
    } catch (err) {
        if (err instanceof Error) {
            if (err.name === 'EEXIST') {
                return path;
            }
        }

        throw err;
    }

    return path;
}

export {
    Context,
    Initialisable,
    Closeable,
    PropertyValue,
    INTERVAL,
    isType,
    isEventType,
    useParsedEvents,
    isAdmin,
    capitalize,
    finalizeAll,
    peek,
    round,
    getCacheDir,
};
