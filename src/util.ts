import {Statement} from 'bun:sqlite';
import {mkdir} from 'fs/promises';
import {IrcEvent, MiddlewareHandler} from 'irc-framework';
import {resolve} from 'path';

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
    return arr[i+1];
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
        throw new Error('Assertion failed:' +
        ` ${JSON.stringify(obj)} does not have "${prop}" property`);
    }
}

export {
    Closeable, Context,
    Initialisable, PropertyValue, assertObject, capitalize,
    finalizeAll, getCacheDir, isAdmin, isEventType,
    isNumber, isType, objectKeys, peek, useParsedEvents
};
