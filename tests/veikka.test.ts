import {VeikkaOptions, Veikka} from '../lib/veikka';

describe('veikka module', () => {
    describe('Veikka class', () => {
        test('constructor(): doesn\'t throw with no options', () => {
            expect(() => new Veikka()).not.toThrow();
        });

        test('constructor(): sets default options', () => {
            const options: VeikkaOptions = {nick: 'Weikka'};
            const veikka = new Veikka(options);

            expect(veikka.getOptions()).toHaveProperty('nick', 'Weikka');
            expect(veikka.getOptions()).toHaveProperty('gecos', 'Veikka');
        });

        test('getOptions(): returns options', () => {
            const options: VeikkaOptions = {nick: 'Weikka'};
            const veikka = new Veikka(options);

            expect(veikka.getOptions()).toHaveProperty('nick', 'Weikka');
        });
    });
});
