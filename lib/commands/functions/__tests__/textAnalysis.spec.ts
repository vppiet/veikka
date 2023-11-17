import {describe, test, expect} from 'bun:test';

import {getWordSyllables} from '../textAnalysis';

/*
test cases based on:
- https://fi.wikipedia.org/wiki/Diftongi
- https://kaino.kotus.fi/visk/sisallys.php?p=11
- https://www.kielikello.fi/-/agronomi-mutta-aggressiivinen-konsonanttiyhtymista-
ja-niiden-kirjoitusasusta
*/

describe('textAnalysis', () => {
    test.only('getWordSyllables(): diphthongs', () => {
        expect(getWordSyllables('suotta')).toEqual(['suot', 'ta']);
        expect(getWordSyllables('Suomi')).toEqual(['Suo', 'mi']);

        expect(getWordSyllables('Suomen')).toEqual(['Suo', 'men']);
        expect(getWordSyllables('kouluissa')).toEqual(['kou', 'luis', 'sa']);
        expect(getWordSyllables('hiukan')).toEqual(['hiu', 'kan']);
        expect(getWordSyllables('ihaillaan')).toEqual(['i', 'hail', 'laan']);
        expect(getWordSyllables('syksyisinä')).toEqual(['syk', 'syi', 'si', 'nä']);
        expect(getWordSyllables('työpäivinä')).toEqual(['työ', 'päi', 'vi', 'nä']);
        expect(getWordSyllables('meidän')).toEqual(['mei', 'dän']);
        expect(getWordSyllables('poikien')).toEqual(['poi', 'ki', 'en']);
        expect(getWordSyllables('höyläystöiden')).toEqual(['höy', 'läys', 'töi', 'den']);
        expect(getWordSyllables('kauneutta')).toEqual(['kau', 'neut', 'ta']);
    });

    test.only('getWordSyllables(): CV', () => {
        expect(getWordSyllables('jana')).toEqual(['ja', 'na']);
        expect(getWordSyllables('katosi')).toEqual(['ka', 'to', 'si']);
        expect(getWordSyllables('hedelmä')).toEqual(['he', 'del', 'mä']);
    });

    test.only('getWordSyllables(): CVC', () => {
        expect(getWordSyllables('kasku')).toEqual(['kas', 'ku']);
        expect(getWordSyllables('raskas')).toEqual(['ras', 'kas']);
        expect(getWordSyllables('raskaskulkuinen')).toEqual(['ras', 'kas', 'kul', 'kui', 'nen']);
        expect(getWordSyllables('kasvit')).toEqual(['kas', 'vit']);
        expect(getWordSyllables('naapurusto')).toEqual(['naa', 'pu', 'rus', 'to']);
        expect(getWordSyllables('naapurit')).toEqual(['naa', 'pu', 'rit']);
    });

    test.only('getWordSyllables(): CVCC', () => {
        expect(getWordSyllables('myrsky')).toEqual(['myrs', 'ky']);
        expect(getWordSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(getWordSyllables('luutnantti'))
            .toEqual(['luut', 'nant', 'ti']);
        expect(getWordSyllables('katafalkki')).toEqual(['ka', 'ta', 'falk', 'ki']);
    });

    test.only('getWordSyllables(): CVV', () => {
        expect(getWordSyllables('täi')).toEqual(['täi']);
        expect(getWordSyllables('vei')).toEqual(['vei']);
        expect(getWordSyllables('epäily')).toEqual(['e', 'päi', 'ly']);
        expect(getWordSyllables('antaa')).toEqual(['an', 'taa']);
        expect(getWordSyllables('eliksiiri')).toEqual(['e', 'lik', 'sii', 'ri']);
        expect(getWordSyllables('naapureita')).toEqual(['naa', 'pu', 'rei', 'ta']);
    });

    test.only('getWordSyllables(): CVVC', () => {
        expect(getWordSyllables('puusto')).toEqual(['puus', 'to']);
        expect(getWordSyllables('puista')).toEqual(['puis', 'ta']);
        expect(getWordSyllables('kokeilla')).toEqual(['ko', 'keil', 'la']);
        expect(getWordSyllables('avaruus')).toEqual(['a', 'va', 'ruus']);
        expect(getWordSyllables('avaruutta')).toEqual(['a', 'va', 'ruut', 'ta']);
    });

    test.only('getWordSyllables(): V', () => {
        expect(getWordSyllables('apu')).toEqual(['a', 'pu']);
        expect(getWordSyllables('säie')).toEqual(['säi', 'e']);
        expect(getWordSyllables('avoin')).toEqual(['a', 'voin']);
        expect(getWordSyllables('apu')).toEqual(['a', 'pu']);
        expect(getWordSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(getWordSyllables('eliö')).toEqual(['e', 'li', 'ö']);
        expect(getWordSyllables('aikoa')).toEqual(['ai', 'ko', 'a']);
    });

    test.only('getWordSyllables(): VC', () => {
        expect(getWordSyllables('äsken')).toEqual(['äs', 'ken']);
        expect(getWordSyllables('kauan')).toEqual(['kau', 'an']);
        expect(getWordSyllables('apeus')).toEqual(['a', 'peus']);
    });

    test.only('getWordSyllables(): VCC', () => {
        expect(getWordSyllables('irstas')).toEqual(['irs', 'tas']);
        expect(getWordSyllables('aortta')).toEqual(['a', 'ort', 'ta']); // rare
        expect(getWordSyllables('variantti')).toEqual(['va', 'ri', 'ant', 'ti']); // rare
    });

    test.only('getWordSyllables(): VV', () => {
        expect(getWordSyllables('uoma')).toEqual(['uo', 'ma']);
        expect(getWordSyllables('kauaa')).toEqual(['kau', 'aa']);
        expect(getWordSyllables('vihreää')).toEqual(['vih', 're', 'ää']);
    });

    test.only('getWordSyllables(): CCV foreign', () => {
        expect(getWordSyllables('prosentti')).toEqual(['pro', 'sent', 'ti']);
        expect(getWordSyllables('ekstra')).toEqual(['eks', 'tra']);
        expect(getWordSyllables('katastrofi')).toEqual(['ka', 'tas', 'tro', 'fi']);
    });

    test.only('getWordSyllables(): CCVC foreign', () => {
        expect(getWordSyllables('trendi')).toEqual(['tren', 'di']);
        // expect(getWordSyllables('abstrakti')).toEqual(['abs', 'trak', 'ti']);
    });
});
