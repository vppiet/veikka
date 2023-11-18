import {describe, test, expect} from 'bun:test';

import {getWordSyllables} from '../textAnalysis';

/*
test cases based on:
- https://fi.wikipedia.org/wiki/Diftongi
- https://kaino.kotus.fi/visk/sisallys.php?p=11
- https://www.kielikello.fi/-/tavun-rajat
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
        expect(getWordSyllables('abstrakti')).toEqual(['abs', 'trak', 'ti']);
    });

    test.only('getWordSyllables(): CCVCC foreign', () => {
        expect(getWordSyllables('flunssa')).toEqual(['fluns', 'sa']);
    });

    test.only('getWordSyllables(): CCVV foreign', () => {
        expect(getWordSyllables('klaava')).toEqual(['klaa', 'va']);
        expect(getWordSyllables('hamstraaja')).toEqual(['hams', 'traa', 'ja']);
        expect(getWordSyllables('demonstraatio')).toEqual(['de', 'mons', 'traa', 'ti', 'o']);
    });

    test.only('getWordSyllables(): CCVVC foreign', () => {
        expect(getWordSyllables('kraatteri')).toEqual(['kraat', 'te', 'ri']);
        expect(getWordSyllables('maistraatti')).toEqual(['mais', 'traat', 'ti']);
        expect(getWordSyllables('orkestrointi')).toEqual(['or', 'kes', 'troin', 'ti']);
    });

    test.only('getWordSyllables(): sCCVVC foreign', () => {
        expect(getWordSyllables('stressi')).toEqual(['stres', 'si']);
    });

    test.only('getWordSyllables(): sCCVVC foreign', () => {
        expect(getWordSyllables('sprinkleri')).toEqual(['sprink', 'le', 'ri']);
    });

    test.only('getWordSyllables(): miscellaneous', () => {
        expect(getWordSyllables('kalja')).toEqual(['kal', 'ja']);
        expect(getWordSyllables('limppari')).toEqual(['limp', 'pa', 'ri']);
        expect(getWordSyllables('horisontti')).toEqual(['ho', 'ri', 'sont', 'ti']);
        expect(getWordSyllables('kauhea')).toEqual(['kau', 'he', 'a']);
        expect(getWordSyllables('ystävällinen')).toEqual(['ys', 'tä', 'väl', 'li', 'nen']);
        expect(getWordSyllables('reitittää')).toEqual(['rei', 'tit', 'tää']);

        expect(getWordSyllables('etsiä')).toEqual(['et', 'si', 'ä']);
        expect(getWordSyllables('yksiö')).toEqual(['yk', 'si', 'ö']);
        expect(getWordSyllables('kielsi')).toEqual(['kiel', 'si']);
        expect(getWordSyllables('miniää')).toEqual(['mi', 'ni', 'ää']);
        expect(getWordSyllables('portti')).toEqual(['port', 'ti']);
        expect(getWordSyllables('yrtti')).toEqual(['yrt', 'ti']);
        expect(getWordSyllables('kaartui')).toEqual(['kaar', 'tui']);
        expect(getWordSyllables('jäädään')).toEqual(['jää', 'dään']);
        expect(getWordSyllables('äiti')).toEqual(['äi', 'ti']);
        expect(getWordSyllables('asu')).toEqual(['a', 'su']);
        expect(getWordSyllables('kehu')).toEqual(['ke', 'hu']);
        expect(getWordSyllables('myyrä')).toEqual(['myy', 'rä']);
        expect(getWordSyllables('säiliö')).toEqual(['säi', 'li', 'ö']);
        expect(getWordSyllables('appi')).toEqual(['ap', 'pi']);
        expect(getWordSyllables('käskyt')).toEqual(['käs', 'kyt']);
        expect(getWordSyllables('alttari')).toEqual(['alt', 'ta', 'ri']);
        expect(getWordSyllables('nuottaa')).toEqual(['nuot', 'taa']);
        expect(getWordSyllables('peitteessä')).toEqual(['peit', 'tees', 'sä']);

        expect(getWordSyllables('leyhyä')).toEqual(['ley', 'hy', 'ä']);
        expect(getWordSyllables('paperien')).toEqual(['pa', 'pe', 'ri', 'en']);
        expect(getWordSyllables('hygienia')).toEqual(['hy', 'gi', 'e', 'ni', 'a']);
        expect(getWordSyllables('vian')).toEqual(['vi', 'an']);
        expect(getWordSyllables('koala')).toEqual(['ko', 'a', 'la']);
        expect(getWordSyllables('dia')).toEqual(['di', 'a']);
        expect(getWordSyllables('korkea')).toEqual(['kor', 'ke', 'a']);
        expect(getWordSyllables('myllyä')).toEqual(['myl', 'ly', 'ä']);
        expect(getWordSyllables('pian')).toEqual(['pi', 'an']);
        expect(getWordSyllables('hion')).toEqual(['hi', 'on']);
        expect(getWordSyllables('hioin')).toEqual(['hi', 'oin']);
        expect(getWordSyllables('hioa')).toEqual(['hi', 'o', 'a']);
        expect(getWordSyllables('rae')).toEqual(['ra', 'e']);
        expect(getWordSyllables('koe')).toEqual(['ko', 'e']);
        expect(getWordSyllables('aie')).toEqual(['ai', 'e']);
        expect(getWordSyllables('raot')).toEqual(['ra', 'ot']);
        expect(getWordSyllables('teos')).toEqual(['te', 'os']);
        expect(getWordSyllables('teollisuus')).toEqual(['te', 'ol', 'li', 'suus']);
        expect(getWordSyllables('piano')).toEqual(['pi', 'a', 'no']);
        expect(getWordSyllables('biologi')).toEqual(['bi', 'o', 'lo', 'gi']);
        expect(getWordSyllables('geometria')).toEqual(['ge', 'o', 'met', 'ri', 'a']);
        expect(getWordSyllables('maestro')).toEqual(['ma', 'est', 'ro']);
        expect(getWordSyllables('teatteri')).toEqual(['te', 'at', 'te', 'ri']);
        expect(getWordSyllables('Leo')).toEqual(['Le', 'o']);
        expect(getWordSyllables('Joel')).toEqual(['Jo', 'el']);
        expect(getWordSyllables('vapaaehtoinen')).toEqual(['va', 'paa', 'eh', 'toi', 'nen']);
        expect(getWordSyllables('korkeafrekvenssinen'))
            .toEqual(['kor', 'ke', 'a', 'frek', 'vens', 'si', 'nen']);
        expect(getWordSyllables('matalafrekvenssinen'))
            .toEqual(['ma', 'ta', 'la', 'frek', 'vens', 'si', 'nen']);
        expect(getWordSyllables('ekspatriaatti')).toEqual(['eks', 'pat', 'ri', 'aat', 'ti']);
        expect(getWordSyllables('aate')).toEqual(['aa', 'te']);
        expect(getWordSyllables('aatteidensa')).toEqual(['aat', 'tei', 'den', 'sa']);
        expect(getWordSyllables('aatteellinen')).toEqual(['aat', 'teel', 'li', 'nen']);
        expect(getWordSyllables('lääketiede')).toEqual(['lää', 'ke', 'tie', 'de']);
        expect(getWordSyllables('')).toEqual([]);
    });
});
