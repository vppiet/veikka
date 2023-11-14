import {describe, test, expect} from 'bun:test';

import {getSyllables} from '../textAnalysis';

// test cases based on:
// - https://kaino.kotus.fi/visk/sisallys.php?p=11

describe('textAnalysis', () => {
    // test('getSyllables(): CV', () => {
    //     expect(getSyllables('jana')).toEqual(['ja', 'na']);
    //     expect(getSyllables('katosi')).toEqual(['ka', 'to', 'si']);
    //     expect(getSyllables('hedelmä')).toEqual(['he', 'del', 'mä']);
    // });

    // test('getSyllables(): CVC', () => {
    //     expect(getSyllables('kasku')).toEqual(['kas', 'ku']);
    //     expect(getSyllables('tarinatasku')).toEqual(['ta', 'ri', 'na', 'tas', 'ku']);
    // });

    // test('getSyllables(): CVC', () => {
    //     expect(getSyllables('kasku')).toEqual(['kas', 'ku']);
    //     expect(getSyllables('raskas')).toEqual(['ras', 'kas']);
    //     expect(getSyllables('kasvit')).toEqual(['kas', 'vit']);
    //     expect(getSyllables('naapurusto')).toEqual(['naa', 'pu', 'rus', 'to']);
    //     expect(getSyllables('naapurit')).toEqual(['naa', 'pu', 'rit']);
    // });

    test.only('getSyllables(): CVCC', () => {
        // expect(getSyllables('myrsky')).toEqual(['myrs', 'ky']);
        // expect(getSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(getSyllables('katafalkki')).toEqual(['ka', 'ta', 'falk', 'ki']);
    });
});
