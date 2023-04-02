import {describe, test, expect} from '@jest/globals';
import {Client, RegisteredEvent} from 'irc-framework';
import MiddlewareHandler from 'middleware-handler';

import {Veikka} from '../veikka';

/* eslint-disable max-len */

describe('veikka module', () => {
    describe('Veikka class', () => {
        test('connect(): connects to local server', (done) => {
            const opts = {nick: 'veikka', username: 'veikka', gecos: 'Veikka'};
            const veikka = new Veikka(opts);

            const client = veikka.getClient();
            client.use((client: Client, rawEvents: MiddlewareHandler, parsedEvents: MiddlewareHandler) => {
                function handler(command: string, event: RegisteredEvent, client: Client, next: () => void) {
                    if (command === 'registered') {
                        expect(veikka.isConnected()).toBe(true);
                        client.quit();
                        done();
                    }

                    next();
                }

                parsedEvents.use(handler);
            });

            // IMPORTANT: requires an IRC server to be running in localhost!
            veikka.connect({host: 'localhost', port: 6667});
        }, 2000);
    });
});
