import {Statement} from 'bun:sqlite';
import {mkdir} from 'fs/promises';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {resolve} from 'path';

import {Service} from './service';
import {Veikka} from './veikka';

interface Context<L> {
    client: Veikka;
    listener: L;
}

interface Initialisable {
    initialise(client: Veikka): void;
}

interface Closeable {
    close(client: Veikka): void;
}

type PropertyValue<T extends Record<PropertyKey, unknown>> = T[keyof T];

function isType<T, U = unknown>(o: U, props: string[]): o is T & U {
    if (o && typeof o === 'object') {
        return props.every((p) => p in o);
    }

    return false;
}

function isInitialisable<T extends object>(o: T): o is T & Initialisable {
    return isType<Initialisable, T>(o, ['initialise']);
}

function isCloseable<T extends object>(o: T): o is T & Closeable {
    return isType<Closeable, T>(o, ['close']);
}

function isEventType<T extends IrcEvent>(
    actualCmd: string,
    expectedCmd: string,
    event: IrcEvent
): event is T {
    return actualCmd.toLowerCase() === expectedCmd.toLowerCase();
}

function isServiceType<T extends Service>(s: Service | undefined, id: symbol): s is T {
    return s !== undefined && s.id === id;
}

function useParsedEvents(
    handler: (command: string, event: IrcEvent, client: Veikka, next: (err?: Error) => void) => void
) {
    return (client: Veikka, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
        parsedEvents.use(handler);
    };
}

function isAdmin(ident: string, hostname: string) {
    return ident + '@' + hostname === Bun.env.ADMIN_MASK;
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
    return arr[i + 1];
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

function isNumber(value: unknown) {
    return !Number.isNaN(Number(value));
}

function objectKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}

function assertObject<T extends object>(obj: object, prop: string): asserts obj is T {
    if (!(prop in obj)) {
        throw new Error(
            'Assertion failed:' + ` ${JSON.stringify(obj)} does not have "${prop}" property`
        );
    }
}

const UP_ARROW = '\u2191';
const DOWN_ARROW = '\u2193';

export {
    Closeable,
    Context,
    DOWN_ARROW,
    Initialisable,
    PropertyValue,
    UP_ARROW,
    assertObject,
    capitalize,
    finalizeAll,
    getCacheDir,
    isAdmin,
    isCloseable,
    isEventType,
    isInitialisable,
    isNumber,
    isServiceType,
    isType,
    objectKeys,
    peek,
    useParsedEvents,
};
