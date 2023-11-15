import {describe, test, expect} from 'bun:test';

import {getSyllables} from '../textAnalysis';

// test cases based on:
// - https://kaino.kotus.fi/visk/sisallys.php?p=11

describe('textAnalysis', () => {
    test.only('getSyllables(): CV', () => {
        expect(getSyllables('jana')).toEqual(['ja', 'na']);
        expect(getSyllables('katosi')).toEqual(['ka', 'to', 'si']);
        expect(getSyllables('hedelmä')).toEqual(['he', 'del', 'mä']);
    });

    test.only('getSyllables(): CVC', () => {
        expect(getSyllables('kasku')).toEqual(['kas', 'ku']);
        expect(getSyllables('raskas')).toEqual(['ras', 'kas']);
        expect(getSyllables('raskaskulkuinen')).toEqual(['ras', 'kas', 'kul', 'kui', 'nen']);
        expect(getSyllables('kasvit')).toEqual(['kas', 'vit']);
        expect(getSyllables('naapurusto')).toEqual(['naa', 'pu', 'rus', 'to']);
        expect(getSyllables('naapurit')).toEqual(['naa', 'pu', 'rit']);
    });

    test.only('getSyllables(): CVCC', () => {
        expect(getSyllables('myrsky')).toEqual(['myrs', 'ky']);
        expect(getSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(getSyllables('katafalkki')).toEqual(['ka', 'ta', 'falk', 'ki']);
    });

    test.only('getSyllables(): CVV', () => {
        expect(getSyllables('täi')).toEqual(['täi']);
        expect(getSyllables('täikampa')).toEqual(['täi', 'kam', 'pa']);
        expect(getSyllables('päätäi')).toEqual(['pää', 'täi']);
        expect(getSyllables('vei')).toEqual(['vei']);
        expect(getSyllables('epäily')).toEqual(['e', 'päi', 'ly']);
        expect(getSyllables('antaa')).toEqual(['an', 'taa']);
        expect(getSyllables('eliksiiri')).toEqual(['e', 'lik', 'sii', 'ri']);
        expect(getSyllables('naapureita')).toEqual(['naa', 'pu', 'rei', 'ta']);
    });
});
