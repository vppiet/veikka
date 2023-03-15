import {VeikkaOptions, Veikka} from '../lib/veikka';

describe('veikka module', () => {
    test('connects to QuakeNet', () => {
        const options: VeikkaOptions = {
            host: 'localhost',
            port: 1234,
        };
        const veikka = new Veikka(options);
        expect(veikka.isConnected());
    });
});
